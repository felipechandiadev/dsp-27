import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CreateSubtaskCommand } from '../application/commands/create-subtask.command';
import { UpdateTaskObjectivesCommand } from '../application/commands/update-task-objectives.command';
import { ListSubtasksByTaskQuery } from '../application/queries/list-subtasks-by-task.query';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateObjectivesDto } from './dto/update-objectives.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':taskId/subtasks')
  listSubtasks(@Param('taskId') taskId: string) {
    return this.queryBus.execute(new ListSubtasksByTaskQuery(taskId));
  }

  @Post(':taskId/subtasks')
  createSubtask(
    @Param('taskId') taskId: string,
    @Body() dto: CreateSubtaskDto,
  ) {
    return this.commandBus.execute(
      new CreateSubtaskCommand(taskId, {
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
      new UpdateTaskObjectivesCommand(id, dto.strategicObjectiveIds),
    );
  }
}
