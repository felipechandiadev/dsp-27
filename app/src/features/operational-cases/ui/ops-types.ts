export type CatalogType = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  status: string;
};

export type IncidenciaRow = {
  id: string;
  code: string;
  status: string;
  title: string;
  descripcion: string | null;
  incidentTypeId: string | null;
  incidentType: { id: string; code: string; name: string } | null;
  occurredAt: string;
  lat: number | null;
  lng: number | null;
  locationDescription: string | null;
  areaId: string | null;
  requerimientoId: string | null;
  ingressChannel: string;
  registrationOrigin: string;
  createdAt: string;
};

export type RequerimientoRow = {
  id: string;
  code: string;
  status: string;
  prioridad: string;
  descripcion: string;
  occurredAt: string;
  lat: number | null;
  lng: number | null;
  locationDescription: string | null;
  areaId: string | null;
  incidenciaId: string | null;
  personaSolicitanteId: string | null;
  closedAt: string | null;
  closeReason: string | null;
  createdAt: string;
};

export type FieldOperationRow = {
  id: string;
  code: string;
  status: string;
  triggerType: string;
  prioridad: string;
  briefing: string | null;
  operationTypeId: string | null;
  operationType: { id: string; code: string; name: string } | null;
  requerimientoId: string | null;
  incidenciaId: string | null;
  assignedStaffId: string | null;
  areaId: string | null;
  createdAt: string;
};

export const INC_STATUS_LABELS: Record<string, string> = {
  sin_verificar: 'Sin verificar',
  verificada: 'Verificada',
  descartada: 'Descartada',
};

export const REQ_STATUS_LABELS: Record<string, string> = {
  ingresado: 'Ingresado',
  en_gestion: 'En gestión',
  derivado: 'Derivado',
  resuelto: 'Resuelto',
  no_resuelto: 'No resuelto',
  descartado: 'Descartado',
};

export const OP_STATUS_LABELS: Record<string, string> = {
  asignada: 'Asignada',
  en_traslado: 'En traslado',
  ejecutando: 'Ejecutando',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
  fallida: 'Fallida',
};

/** Códigos P0–P3 se mantienen en API/BD; en UI se muestran estas etiquetas. */
export const PRIORITY_LABELS: Record<string, string> = {
  P0: 'Emergencia',
  P1: 'Urgente',
  P2: 'Normal',
  P3: 'Informativo',
};

export const PRIORITY_OPTIONS = [
  { id: 'P0', label: PRIORITY_LABELS.P0 },
  { id: 'P1', label: PRIORITY_LABELS.P1 },
  { id: 'P2', label: PRIORITY_LABELS.P2 },
  { id: 'P3', label: PRIORITY_LABELS.P3 },
] as const;

export function priorityLabel(code: string | null | undefined): string {
  if (!code) return '—';
  return PRIORITY_LABELS[code] ?? code;
}

export type BadgeVariantName =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'primary-outlined'
  | 'secondary-outlined'
  | 'success-outlined'
  | 'error-outlined'
  | 'warning-outlined'
  | 'info-outlined';

export const INC_STATUS_BADGE: Record<string, BadgeVariantName> = {
  sin_verificar: 'warning',
  verificada: 'success',
  descartada: 'secondary',
};

export const REQ_STATUS_BADGE: Record<string, BadgeVariantName> = {
  ingresado: 'info',
  en_gestion: 'primary',
  derivado: 'secondary',
  resuelto: 'success',
  no_resuelto: 'warning',
  descartado: 'secondary',
};

export const OP_STATUS_BADGE: Record<string, BadgeVariantName> = {
  asignada: 'info',
  en_traslado: 'primary',
  ejecutando: 'warning',
  finalizada: 'success',
  cancelada: 'secondary',
  fallida: 'error',
};

export function formatOpsDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function clampText(value: string | null | undefined, max = 100): string {
  const t = (value ?? '').trim().replace(/\s+/g, ' ');
  if (!t) return '—';
  return t.length > max ? `${t.slice(0, max)}…` : t;
}
