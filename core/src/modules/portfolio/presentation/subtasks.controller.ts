import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { UpdateSubtaskCommand } from '../application/commands/update-subtask.command';
import { UpdateSubtaskObjectivesCommand } from '../application/commands/update-subtask-objectives.command';
import { GetSubtaskQuery } from '../application/queries/get-subtask.query';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { UpdateObjectivesDto } from './dto/update-objectives.dto';

@ApiTags('subtasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subtasks')
export class SubtasksController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetSubtaskQuery(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubtaskDto) {
    return this.commandBus.execute(
      new UpdateSubtaskCommand(id, {
        title: dto.title,
        description: dto.description,
        objectiveText: dto.objectiveText,
        status: dto.status,
        startsOn: dto.startsOn,
        endsOn: dto.endsOn,
        sortOrder: dto.sortOrder,
        strategicObjectiveIds: dto.strategicObjectiveIds,
      }),
    );
  }

  @Put(':id/objectives')
  updateObjectives(
    @Param('id') id: string,
    @Body() dto: UpdateObjectivesDto,
  ) {
    return this.commandBus.execute(
      new UpdateSubtaskObjectivesCommand(id, dto.strategicObjectiveIds),
    );
  }
}
