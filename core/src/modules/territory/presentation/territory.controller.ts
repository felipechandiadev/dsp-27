import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUser } from '@modules/auth/domain/jwt-payload';
import { ListAreaTypesQuery } from '../application/queries/list-area-types.query';
import { ListAreasQuery } from '../application/queries/list-areas.query';
import { GetAreaQuery } from '../application/queries/get-area.query';
import { CreateAreaTypeCommand } from '../application/commands/create-area-type.command';
import { UpdateAreaTypeCommand } from '../application/commands/update-area-type.command';
import { CreateAreaCommand } from '../application/commands/create-area.command';
import { UpdateAreaCommand } from '../application/commands/update-area.command';
import { CreateAreaTypeDto } from './dto/create-area-type.dto';
import { UpdateAreaTypeDto } from './dto/update-area-type.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@ApiTags('territory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('territory')
export class TerritoryController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('area-types')
  listTypes(@Query('status') status?: string) {
    return this.queryBus.execute(new ListAreaTypesQuery(status));
  }

  @Post('area-types')
  createType(@CurrentUser() user: AuthUser, @Body() dto: CreateAreaTypeDto) {
    return this.commandBus.execute(
      new CreateAreaTypeCommand(user.role, {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        color: dto.color,
        sortOrder: dto.sortOrder,
        status: dto.status,
      }),
    );
  }

  @Patch('area-types/:id')
  updateType(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAreaTypeDto,
  ) {
    return this.commandBus.execute(
      new UpdateAreaTypeCommand(user.role, id, {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        sortOrder: dto.sortOrder,
        status: dto.status,
      }),
    );
  }

  @Get('areas')
  listAreas(
    @Query('typeId') typeId?: string,
    @Query('status') status?: string,
  ) {
    return this.queryBus.execute(new ListAreasQuery(typeId, status));
  }

  @Get('areas/:code')
  getArea(@Param('code') code: string) {
    return this.queryBus.execute(new GetAreaQuery(code));
  }

  @Post('areas')
  createArea(@CurrentUser() user: AuthUser, @Body() dto: CreateAreaDto) {
    return this.commandBus.execute(
      new CreateAreaCommand(user.role, {
        name: dto.name,
        typeId: dto.typeId,
        parentId: dto.parentId,
        geometry: dto.geometry,
        notes: dto.notes,
        status: dto.status,
      }),
    );
  }

  @Patch('areas/:code')
  updateArea(
    @CurrentUser() user: AuthUser,
    @Param('code') code: string,
    @Body() dto: UpdateAreaDto,
  ) {
    return this.commandBus.execute(
      new UpdateAreaCommand(user.role, code, {
        name: dto.name,
        typeId: dto.typeId,
        parentId: dto.parentId,
        geometry: dto.geometry,
        notes: dto.notes,
        status: dto.status,
      }),
    );
  }
}
