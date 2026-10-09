import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ListCalendarPeopleQuery } from '../application/queries/list-calendar-people.query';
import { GetTeamCalendarQuery } from '../application/queries/get-team-calendar.query';
import { CalendarLayer } from '../domain/team-calendar.types';

@ApiTags('calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calendar')
export class CalendarController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('people')
  people() {
    return this.queryBus.execute(new ListCalendarPeopleQuery());
  }

  @Get('team')
  team(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('personIds') personIds?: string,
    @Query('layers') layers?: string,
  ) {
    if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      throw new BadRequestException(
        'Parámetros from y to requeridos (YYYY-MM-DD)',
      );
    }
    if (from > to) {
      throw new BadRequestException('from no puede ser posterior a to');
    }

    const ids = personIds
      ? personIds
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : null;

    const layerList = (layers || 'dsp,outlook')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s): s is CalendarLayer => s === 'dsp' || s === 'outlook');

    if (layerList.length === 0) {
      throw new BadRequestException('layers debe incluir dsp y/o outlook');
    }

    return this.queryBus.execute(
      new GetTeamCalendarQuery(from, to, ids, layerList),
    );
  }
}
