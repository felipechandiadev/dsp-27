import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './domain/project.entity';
import { Task } from './domain/task.entity';
import { WorkNote } from './domain/work-note.entity';
import { PORTFOLIO_REPOSITORY } from './application/ports/portfolio.repository.port';
import { TypeOrmPortfolioRepository } from './infrastructure/typeorm-portfolio.repository';
import { PortfolioController } from './presentation/portfolio.controller';
import { ListProjectsHandler } from './application/handlers/list-projects.handler';
import { GetProjectHandler } from './application/handlers/get-project.handler';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Project, Task, WorkNote])],
  controllers: [PortfolioController],
  providers: [
    { provide: PORTFOLIO_REPOSITORY, useClass: TypeOrmPortfolioRepository },
    ListProjectsHandler,
    GetProjectHandler,
  ],
  exports: [TypeOrmModule, PORTFOLIO_REPOSITORY],
})
export class PortfolioModule {}
