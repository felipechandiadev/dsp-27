import { PlanInstrument } from '@modules/plan/domain/plan-instrument.entity';
import { StrategicObjective } from '@modules/plan/domain/strategic-objective.entity';

export const PLAN_REPOSITORY = Symbol('PLAN_REPOSITORY');

export interface PlanRepositoryPort {
  findActiveInstrument(): Promise<PlanInstrument | null>;
  findObjectivesByPlanId(planId: string): Promise<StrategicObjective[]>;
}
