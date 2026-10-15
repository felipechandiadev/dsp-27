import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUser } from '@modules/auth/domain/jwt-payload';
import { ListPreventivePatrolsQuery } from '../application/queries/list-preventive-patrols.query';
import { GetPreventivePatrolQuery } from '../application/queries/get-preventive-patrol.query';
import { CreatePreventivePatrolCommand } from '../application/commands/create-preventive-patrol.command';
import { CreatePreventivePatrolDto } from './dto/create-preventive-patrol.dto';

@ApiTags('preventive-patrols')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('preventive-patrols')
export class PreventivePatrolsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  list(@Query('limit') limit?: string) {
    return this.queryBus.execute(
      new ListPreventivePatrolsQuery(limit ? Number(limit) : undefined),
    );
  }

  @Get(':code')
  get(@Param('code') code: string) {
    return this.queryBus.execute(new GetPreventivePatrolQuery(code));
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePreventivePatrolDto,
  ) {
    return this.commandBus.execute(
      new CreatePreventivePatrolCommand(user.role, user.id ?? null, dto.payload),
    );
  }
}
