export const CONTRACT_KINDS = [
  'arriendo',
  'guardias',
  'aparcadero',
  'otro',
] as const;

export type ContractKind = (typeof CONTRACT_KINDS)[number];

export const PERIOD_DOC_TYPES_BY_KIND: Record<ContractKind, string[]> = {
  arriendo: ['factura', 'informe_servicio', 'acta_visita'],
  guardias: ['asistencia', 'factura', 'informe_servicio', 'acta_visita'],
  aparcadero: ['factura', 'informe_servicio', 'acta_visita'],
  otro: ['factura', 'informe_servicio', 'acta_visita'],
};

export function isContractKind(value: string): value is ContractKind {
  return (CONTRACT_KINDS as readonly string[]).includes(value);
}

export function checklistForKind(kind: string): string[] {
  if (isContractKind(kind)) return PERIOD_DOC_TYPES_BY_KIND[kind];
  return PERIOD_DOC_TYPES_BY_KIND.otro;
}
