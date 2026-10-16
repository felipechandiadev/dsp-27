import * as fs from 'fs';
import * as path from 'path';

export type SeedInspectorRow = {
  fullName: string;
  documentNumber: string;
  phone: string;
  laborRegime: string;
};

export type SeedInspectorPerson = {
  firstName: string;
  lastName: string;
  documentNumber: string;
  phone: string;
  laborRegime: string;
  /** Prefijo de folio interno (CTR = contrata, etc.). */
  regimeCode: string;
};

function titleCaseWords(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/(^|[\s'-])\S/g, (ch) => ch.toUpperCase());
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: 'Sin', lastName: 'Nombre' };
  }
  if (parts.length === 1) {
    return { firstName: titleCaseWords(parts[0]), lastName: '—' };
  }
  return {
    firstName: titleCaseWords(parts[0]),
    lastName: titleCaseWords(parts.slice(1).join(' ')),
  };
}

function regimeCodeFor(regime: string): string {
  const normalized = regime.trim().toUpperCase();
  if (normalized.includes('CONTRATA')) return 'CTR';
  if (normalized.includes('PLANTA')) return 'PLT';
  if (normalized.includes('HONOR')) return 'HON';
  return 'PER';
}

/** Origen: `seed-assets/inspectors.xlsx` (exportado a JSON para el seed). */
export function loadSeedInspectors(): SeedInspectorPerson[] {
  const jsonPath = path.join(__dirname, 'seed-assets', 'inspectors.json');
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as SeedInspectorRow[];
  return raw.map((row) => {
    const { firstName, lastName } = splitFullName(row.fullName);
    const laborRegime = row.laborRegime.trim().toUpperCase();
    return {
      firstName,
      lastName,
      documentNumber: row.documentNumber.trim(),
      phone: String(row.phone).trim(),
      laborRegime,
      regimeCode: regimeCodeFor(laborRegime),
    };
  });
}
