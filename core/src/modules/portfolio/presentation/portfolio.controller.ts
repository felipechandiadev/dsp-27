import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUser } from '@modules/auth/domain/jwt-payload';
import { ListProjectsQuery } from '../application/queries/list-projects.query';
import { GetProjectQuery } from '../application/queries/get-project.query';
import { ListTaskAssigneesQuery } from '../application/queries/list-task-assignees.query';
import { AssignTaskCommand } from '../application/commands/assign-task.command';
import { AssignTaskDto } from './dto/assign-task.dto';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class PortfolioController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  list() {
    return this.queryBus.execute(new ListProjectsQuery());
  }

  @Get('tasks/:taskId/assignees')
  listAssignees(@Param('taskId') taskId: string) {
    return this.queryBus.execute(new ListTaskAssigneesQuery(taskId));
  }

  @Post('tasks/:taskId/assignees')
  assign(
    @CurrentUser() user: AuthUser,
    @Param('taskId') taskId: string,
    @Body() dto: AssignTaskDto,
  ) {
    return this.commandBus.execute(
      new AssignTaskCommand(
        user.id,
        taskId,
        dto.personId,
        dto.assignmentRole || 'executor',
      ),
    );
  }

  @Get(':code')
  getOne(@Param('code') code: string) {
    return this.queryBus.execute(new GetProjectQuery(code));
  }
}
