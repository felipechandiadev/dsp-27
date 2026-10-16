import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanInstrument } from '../domain/plan-instrument.entity';
import { StrategicObjective } from '../domain/strategic-objective.entity';
import { Project } from '@modules/portfolio/domain/project.entity';
import { Task } from '@modules/portfolio/domain/task.entity';
import { Subtask } from '@modules/portfolio/domain/subtask.entity';
import {
  ObjectiveLinkedProject,
  ObjectiveLinkedSubtask,
  ObjectiveLinkedTask,
  PlanRepositoryPort,
} from '../application/ports/plan.repository.port';

@Injectable()
export class TypeOrmPlanRepository implements PlanRepositoryPort {
  constructor(
    @InjectRepository(PlanInstrument)
    private readonly plans: Repository<PlanInstrument>,
    @InjectRepository(StrategicObjective)
    private readonly objectives: Repository<StrategicObjective>,
    @InjectRepository(Project)
    private readonly projects: Repository<Project>,
    @InjectRepository(Task)
    private readonly tasks: Repository<Task>,
    @InjectRepository(Subtask)
    private readonly subtasks: Repository<Subtask>,
  ) {}

  findActiveInstrument(): Promise<PlanInstrument | null> {
    return this.plans.findOne({
      where: { status: 'active' },
      order: { year: 'DESC' },
    });
  }

  findObjectivesByPlanId(planId: string): Promise<StrategicObjective[]> {
    return this.objectives.find({
      where: { planInstrumentId: planId },
      order: { code: 'ASC' },
    });
  }

  async findProjectsLinkedToObjectives(
    objectiveIds: string[],
  ): Promise<ObjectiveLinkedProject[]> {
    if (objectiveIds.length === 0) return [];
    const rows = await this.projects
      .createQueryBuilder('p')
      .innerJoin('p.strategicObjectives', 'o')
      .where('o.id IN (:...objectiveIds)', { objectiveIds })
      .andWhere('p.deletedAt IS NULL')
      .select([
        'o.id AS "objectiveId"',
        'p.id AS id',
        'p.code AS code',
        'p.title AS title',
        'p.status AS status',
      ])
      .getRawMany<ObjectiveLinkedProject>();
    return rows;
  }

  async findTasksLinkedToObjectives(
    objectiveIds: string[],
  ): Promise<ObjectiveLinkedTask[]> {
    if (objectiveIds.length === 0) return [];
    const rows = await this.tasks
      .createQueryBuilder('t')
      .innerJoin('t.strategicObjectives', 'o')
      .where('o.id IN (:...objectiveIds)', { objectiveIds })
      .andWhere('t.deletedAt IS NULL')
      .select([
        'o.id AS "objectiveId"',
        't.id AS id',
        't.code AS code',
        't.title AS title',
        't.status AS status',
      ])
      .getRawMany<ObjectiveLinkedTask>();
    return rows;
  }

  async findSubtasksLinkedToObjectives(
    objectiveIds: string[],
  ): Promise<ObjectiveLinkedSubtask[]> {
    if (objectiveIds.length === 0) return [];
    const rows = await this.subtasks
      .createQueryBuilder('s')
      .innerJoin('s.strategicObjectives', 'o')
      .where('o.id IN (:...objectiveIds)', { objectiveIds })
      .andWhere('s.deletedAt IS NULL')
      .select([
        'o.id AS "objectiveId"',
        's.id AS id',
        's.title AS title',
        's.status AS status',
        's.taskId AS "taskId"',
      ])
      .getRawMany<ObjectiveLinkedSubtask>();
    return rows;
  }
}
