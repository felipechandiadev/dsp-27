import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@modules/portfolio/domain/project.entity';
import { Task } from '@modules/portfolio/domain/task.entity';
import { Subtask } from '@modules/portfolio/domain/subtask.entity';
import { PlanInstrument } from './domain/plan-instrument.entity';
import { StrategicObjective } from './domain/strategic-objective.entity';
import { PLAN_REPOSITORY } from './application/ports/plan.repository.port';
import { TypeOrmPlanRepository } from './infrastructure/typeorm-plan.repository';
import { PlanController } from './presentation/plan.controller';
import { GetPlanHandler } from './application/handlers/get-plan.handler';
import { GetObjectivesHandler } from './application/handlers/get-objectives.handler';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      PlanInstrument,
      StrategicObjective,
      Project,
      Task,
      Subtask,
    ]),
  ],
  controllers: [PlanController],
  providers: [
    { provide: PLAN_REPOSITORY, useClass: TypeOrmPlanRepository },
    GetPlanHandler,
    GetObjectivesHandler,
  ],
  exports: [TypeOrmModule, PLAN_REPOSITORY],
})
export class PlanModule {}
