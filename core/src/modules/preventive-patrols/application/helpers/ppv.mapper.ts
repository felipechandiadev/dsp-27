import { PreventivePatrol } from '../../domain/preventive-patrol.entity';

export function mapPreventivePatrol(row: PreventivePatrol) {
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    payload: row.payload,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt,
  };
}
