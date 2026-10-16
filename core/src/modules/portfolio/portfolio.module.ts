import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from '@modules/persons/domain/person.entity';
import { StaffMember } from '@modules/staff/domain/staff-member.entity';
import { StrategicObjective } from '@modules/plan/domain/strategic-objective.entity';
import { UsersModule } from '@modules/users/users.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { Project } from './domain/project.entity';
import { Task } from './domain/task.entity';
import { Subtask } from './domain/subtask.entity';
import { WorkNote } from './domain/work-note.entity';
import { TaskAssignee } from './domain/task-assignee.entity';
import { PORTFOLIO_REPOSITORY } from './application/ports/portfolio.repository.port';
import { TypeOrmPortfolioRepository } from './infrastructure/typeorm-portfolio.repository';
import { PortfolioController } from './presentation/portfolio.controller';
import { TasksController } from './presentation/tasks.controller';
import { SubtasksController } from './presentation/subtasks.controller';
import { ListProjectsHandler } from './application/handlers/list-projects.handler';
import { ListTasksHandler } from './application/handlers/list-tasks.handler';
import { GetProjectHandler } from './application/handlers/get-project.handler';
import { AssignTaskHandler } from './application/handlers/assign-task.handler';
import { ListTaskAssigneesHandler } from './application/handlers/list-task-assignees.handler';
import { CreateSubtaskHandler } from './application/handlers/create-subtask.handler';
import { UpdateSubtaskHandler } from './application/handlers/update-subtask.handler';
import { UpdateTaskObjectivesHandler } from './application/handlers/update-task-objectives.handler';
import { UpdateSubtaskObjectivesHandler } from './application/handlers/update-subtask-objectives.handler';
import { ListSubtasksByTaskHandler } from './application/handlers/list-subtasks-by-task.handler';
import { GetSubtaskHandler } from './application/handlers/get-subtask.handler';

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    NotificationsModule,
    TypeOrmModule.forFeature([
      Project,
      Task,
      Subtask,
      WorkNote,
      TaskAssignee,
      Person,
      StaffMember,
      StrategicObjective,
    ]),
  ],
  controllers: [PortfolioController, TasksController, SubtasksController],
  providers: [
    { provide: PORTFOLIO_REPOSITORY, useClass: TypeOrmPortfolioRepository },
    ListProjectsHandler,
    ListTasksHandler,
    GetProjectHandler,
    AssignTaskHandler,
    ListTaskAssigneesHandler,
    CreateSubtaskHandler,
    UpdateSubtaskHandler,
    UpdateTaskObjectivesHandler,
    UpdateSubtaskObjectivesHandler,
    ListSubtasksByTaskHandler,
    GetSubtaskHandler,
  ],
  exports: [TypeOrmModule, PORTFOLIO_REPOSITORY],
})
export class PortfolioModule {}
