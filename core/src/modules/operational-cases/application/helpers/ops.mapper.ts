import { IncidentType } from '../../domain/incident-type.entity';
import { OperationType } from '../../domain/operation-type.entity';
import { Incidencia } from '../../domain/incidencia.entity';
import { Requerimiento } from '../../domain/requerimiento.entity';
import { FieldOperation } from '../../domain/field-operation.entity';

export function mapIncidentType(t: IncidentType) {
  return {
    id: t.id,
    code: t.code,
    name: t.name,
    sortOrder: t.sortOrder,
    status: t.status,
  };
}

export function mapOperationType(t: OperationType) {
  return {
    id: t.id,
    code: t.code,
    name: t.name,
    sortOrder: t.sortOrder,
    status: t.status,
  };
}

export function mapIncidencia(i: Incidencia) {
  return {
    id: i.id,
    code: i.code,
    status: i.status,
    title: i.title,
    descripcion: i.descripcion,
    incidentTypeId: i.incidentTypeId,
    incidentType: i.incidentType
      ? { id: i.incidentType.id, code: i.incidentType.code, name: i.incidentType.name }
      : null,
    occurredAt: i.occurredAt,
    lat: i.lat,
    lng: i.lng,
    locationDescription: i.locationDescription,
    areaId: i.areaId,
    requerimientoId: i.requerimientoId,
    ingressChannel: i.ingressChannel,
    registrationOrigin: i.registrationOrigin,
    createdAt: i.createdAt,
  };
}

export function mapRequerimiento(r: Requerimiento) {
  return {
    id: r.id,
    code: r.code,
    status: r.status,
    prioridad: r.prioridad,
    descripcion: r.descripcion,
    occurredAt: r.occurredAt,
    lat: r.lat,
    lng: r.lng,
    locationDescription: r.locationDescription,
    areaId: r.areaId,
    incidenciaId: r.incidenciaId,
    personaSolicitanteId: r.personaSolicitanteId,
    closedAt: r.closedAt,
    closeReason: r.closeReason,
    createdAt: r.createdAt,
  };
}

export function mapFieldOperation(o: FieldOperation) {
  return {
    id: o.id,
    code: o.code,
    status: o.status,
    triggerType: o.triggerType,
    prioridad: o.prioridad,
    briefing: o.briefing,
    operationTypeId: o.operationTypeId,
    operationType: o.operationType
      ? {
          id: o.operationType.id,
          code: o.operationType.code,
          name: o.operationType.name,
        }
      : null,
    requerimientoId: o.requerimientoId,
    incidenciaId: o.incidenciaId,
    assignedStaffId: o.assignedStaffId,
    areaId: o.areaId,
    createdAt: o.createdAt,
  };
}
