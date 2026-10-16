import { PlanInstrument } from '@modules/plan/domain/plan-instrument.entity';
import { StrategicObjective } from '@modules/plan/domain/strategic-objective.entity';

export const PLAN_REPOSITORY = Symbol('PLAN_REPOSITORY');

export type ObjectiveLinkedProject = {
  objectiveId: string;
  id: string;
  code: string;
  title: string;
  status: string;
};

export type ObjectiveLinkedTask = {
  objectiveId: string;
  id: string;
  code: string | null;
  title: string;
  status: string;
};

export type ObjectiveLinkedSubtask = {
  objectiveId: string;
  id: string;
  title: string;
  status: string;
  taskId: string;
};

export interface PlanRepositoryPort {
  findActiveInstrument(): Promise<PlanInstrument | null>;
  findObjectivesByPlanId(planId: string): Promise<StrategicObjective[]>;
  findProjectsLinkedToObjectives(
    objectiveIds: string[],
  ): Promise<ObjectiveLinkedProject[]>;
  findTasksLinkedToObjectives(
    objectiveIds: string[],
  ): Promise<ObjectiveLinkedTask[]>;
  findSubtasksLinkedToObjectives(
    objectiveIds: string[],
  ): Promise<ObjectiveLinkedSubtask[]>;
}
