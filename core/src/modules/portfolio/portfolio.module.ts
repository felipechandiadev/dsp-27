import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from '@modules/persons/domain/person.entity';
import { StaffMember } from '@modules/staff/domain/staff-member.entity';
import { UsersModule } from '@modules/users/users.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { Project } from './domain/project.entity';
import { Task } from './domain/task.entity';
import { WorkNote } from './domain/work-note.entity';
import { TaskAssignee } from './domain/task-assignee.entity';
import { PORTFOLIO_REPOSITORY } from './application/ports/portfolio.repository.port';
import { TypeOrmPortfolioRepository } from './infrastructure/typeorm-portfolio.repository';
import { PortfolioController } from './presentation/portfolio.controller';
import { ListProjectsHandler } from './application/handlers/list-projects.handler';
import { ListTasksHandler } from './application/handlers/list-tasks.handler';
import { GetProjectHandler } from './application/handlers/get-project.handler';
import { AssignTaskHandler } from './application/handlers/assign-task.handler';
import { ListTaskAssigneesHandler } from './application/handlers/list-task-assignees.handler';

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    NotificationsModule,
    TypeOrmModule.forFeature([
      Project,
      Task,
      WorkNote,
      TaskAssignee,
      Person,
      StaffMember,
    ]),
  ],
  controllers: [PortfolioController],
  providers: [
    { provide: PORTFOLIO_REPOSITORY, useClass: TypeOrmPortfolioRepository },
    ListProjectsHandler,
    ListTasksHandler,
    GetProjectHandler,
    AssignTaskHandler,
    ListTaskAssigneesHandler,
  ],
  exports: [TypeOrmModule, PORTFOLIO_REPOSITORY],
})
export class PortfolioModule {}
