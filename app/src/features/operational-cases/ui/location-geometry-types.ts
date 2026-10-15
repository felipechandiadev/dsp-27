export type GeoJsonPoint = {
  type: 'Point';
  coordinates: number[];
};

export type GeoJsonLineString = {
  type: 'LineString';
  coordinates: number[][];
};

export type GeoJsonPolygon = {
  type: 'Polygon';
  coordinates: number[][][];
};

export type CaseLocationGeometry =
  | GeoJsonPoint
  | GeoJsonLineString
  | GeoJsonPolygon;

export type LocationDrawMode = 'point' | 'line' | 'area';

export const LOCATION_MODE_LABELS: Record<LocationDrawMode, string> = {
  point: 'Punto',
  line: 'Línea',
  area: 'Área',
};

export function modeFromGeometry(
  geometry: CaseLocationGeometry | null | undefined,
): LocationDrawMode {
  if (!geometry) return 'point';
  if (geometry.type === 'Point') return 'point';
  if (geometry.type === 'LineString') return 'line';
  return 'area';
}

export function isCaseLocationGeometry(
  value: unknown,
): value is CaseLocationGeometry {
  if (!value || typeof value !== 'object') return false;
  const g = value as { type?: string };
  return (
    g.type === 'Point' || g.type === 'LineString' || g.type === 'Polygon'
  );
}
