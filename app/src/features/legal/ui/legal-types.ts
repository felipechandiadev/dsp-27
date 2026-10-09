export const LEGAL_NORM_KINDS = [
  'law',
  'decree',
  'regulation',
  'bill',
  'other',
] as const;

export type LegalNormKind = (typeof LEGAL_NORM_KINDS)[number];

export const LEGAL_NORM_KIND_LABELS: Record<LegalNormKind, string> = {
  law: 'Ley',
  decree: 'Decreto',
  regulation: 'Reglamento',
  bill: 'Proyecto de ley',
  other: 'Otro',
};

export const LEGAL_NORM_STATUSES = [
  'in_force',
  'in_process',
  'repealed',
  'superseded',
] as const;

export type LegalNormStatus = (typeof LEGAL_NORM_STATUSES)[number];

export const LEGAL_NORM_STATUS_LABELS: Record<LegalNormStatus, string> = {
  in_force: 'Vigente',
  in_process: 'En trámite',
  repealed: 'Derogada',
  superseded: 'Reemplazada',
};

export type NormListItem = {
  id: string;
  code: string;
  kind: string;
  numberLabel: string;
  shortTitle: string;
  status: string;
  publishedOn?: string | null;
  effectiveOn?: string | null;
  summary: string | null;
  sortOrder: number;
};

export type NormPdfAsset = {
  id: string;
  originalName: string;
  mimeType: string;
  byteSize: number;
  createdAt?: string;
};

export type NormDetail = NormListItem & {
  pdfAsset: NormPdfAsset | null;
};

export function legalKindLabel(kind: string): string {
  if ((LEGAL_NORM_KINDS as readonly string[]).includes(kind)) {
    return LEGAL_NORM_KIND_LABELS[kind as LegalNormKind];
  }
  return kind;
}

export function legalStatusLabel(status: string): string {
  if ((LEGAL_NORM_STATUSES as readonly string[]).includes(status)) {
    return LEGAL_NORM_STATUS_LABELS[status as LegalNormStatus];
  }
  return status;
}

/** Roles que pueden crear/editar normas y subir PDF. */
export function canWriteLegal(role: string | undefined | null): boolean {
  return role === 'direccion' || role === 'administrativo';
}
