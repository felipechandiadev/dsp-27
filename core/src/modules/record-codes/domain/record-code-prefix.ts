export const RECORD_CODE_PREFIXES = [
  'PRY',
  'TAR',
  'CTR',
  'PER',
  'PSN',
] as const;

export type RecordCodePrefix = (typeof RECORD_CODE_PREFIXES)[number];

export function isRecordCodePrefix(value: string): value is RecordCodePrefix {
  return (RECORD_CODE_PREFIXES as readonly string[]).includes(value);
}

export function formatRecordCode(
  prefix: RecordCodePrefix,
  year: number,
  sequence: number,
): string {
  const aa = String(year).slice(-2);
  const n = String(sequence).padStart(6, '0');
  return `${prefix}${aa}${n}`;
}
