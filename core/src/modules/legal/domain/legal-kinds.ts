export const LEGAL_NORM_KINDS = [
  'law',
  'decree',
  'regulation',
  'bill',
  'other',
] as const;

export type LegalNormKind = (typeof LEGAL_NORM_KINDS)[number];

export const LEGAL_NORM_STATUSES = [
  'in_force',
  'in_process',
  'repealed',
  'superseded',
] as const;

export type LegalNormStatus = (typeof LEGAL_NORM_STATUSES)[number];

export function isLegalNormKind(value: string): value is LegalNormKind {
  return (LEGAL_NORM_KINDS as readonly string[]).includes(value);
}

export function isLegalNormStatus(value: string): value is LegalNormStatus {
  return (LEGAL_NORM_STATUSES as readonly string[]).includes(value);
}

/** Prefijos de código por tipo (seed y altas sin code explícito). */
const KIND_CODE_PREFIX: Record<LegalNormKind, string> = {
  law: 'LEY',
  decree: 'DS',
  regulation: 'REG',
  bill: 'BOL',
  other: 'DOC',
};

/**
 * Deriva un code único a partir de kind + numberLabel.
 * Ej.: law + "Ley N.º 21.802" → LEY-21802
 */
export function deriveNormCode(kind: LegalNormKind, numberLabel: string): string {
  const digits = numberLabel.replace(/\D+/g, '');
  const prefix = KIND_CODE_PREFIX[kind];
  if (digits.length >= 4) {
    return `${prefix}-${digits.slice(0, 12)}`;
  }
  const slug = numberLabel
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
  return `${prefix}-${slug || 'SIN-NUM'}`;
}
