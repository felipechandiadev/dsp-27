import { CaseLocationGeometryService } from '../case-location-geometry.service';
import type {
  CaseLocationGeometry,
  CaseLocationTable,
} from '../../domain/location-geometry';

export type WithLocationGeometry<T> = T & {
  locationGeometry: CaseLocationGeometry | null;
};

export async function attachLocationGeometry<T extends { id: string }>(
  service: CaseLocationGeometryService,
  table: CaseLocationTable,
  row: T,
): Promise<WithLocationGeometry<T>> {
  const locationGeometry = await service.read(table, row.id);
  return { ...row, locationGeometry };
}

export async function attachLocationGeometryMany<T extends { id: string }>(
  service: CaseLocationGeometryService,
  table: CaseLocationTable,
  rows: T[],
): Promise<WithLocationGeometry<T>[]> {
  const geomMap = await service.readMany(
    table,
    rows.map((r) => r.id),
  );
  return rows.map((row) => ({
    ...row,
    locationGeometry: geomMap.get(row.id) ?? null,
  }));
}

export function resolveCreateLocationGeometry(input: {
  locationGeometry?: CaseLocationGeometry | null;
  lat?: number;
  lng?: number;
}): CaseLocationGeometry | null | undefined {
  if (input.locationGeometry !== undefined) {
    return input.locationGeometry;
  }
  if (
    input.lat != null &&
    input.lng != null &&
    Number.isFinite(input.lat) &&
    Number.isFinite(input.lng)
  ) {
    return {
      type: 'Point',
      coordinates: [input.lng, input.lat],
    };
  }
  return undefined;
}
