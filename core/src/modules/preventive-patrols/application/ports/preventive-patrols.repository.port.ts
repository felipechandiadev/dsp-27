import { PreventivePatrol } from '../../domain/preventive-patrol.entity';

export const PREVENTIVE_PATROLS_REPOSITORY = Symbol(
  'PREVENTIVE_PATROLS_REPOSITORY',
);

export interface PreventivePatrolsRepositoryPort {
  list(limit?: number): Promise<PreventivePatrol[]>;
  findByCode(code: string): Promise<PreventivePatrol | null>;
  create(data: Partial<PreventivePatrol>): PreventivePatrol;
  save(row: PreventivePatrol): Promise<PreventivePatrol>;
}
