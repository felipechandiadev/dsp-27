export type GeoJsonPolygon = {
  type: 'Polygon';
  coordinates: number[][][];
};

export type AreaTypeRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  color: string | null;
  sortOrder: number;
  status: string;
};

export type OperationAreaRow = {
  id: string;
  code: string;
  name: string;
  typeId: string;
  parentId: string | null;
  status: string;
  notes: string | null;
  geometry: GeoJsonPolygon | null;
  type: {
    id: string;
    code: string;
    name: string;
    color: string | null;
  } | null;
};

export const PARRAL_CENTER = { lat: -36.1415, lng: -71.8265 };
export const DEFAULT_MAP_ZOOM = 13;
export const DEFAULT_BBOX_OFFSET = 0.008;

export function defaultPolygon(): GeoJsonPolygon {
  const { lat, lng } = PARRAL_CENTER;
  const o = DEFAULT_BBOX_OFFSET;
  return {
    type: 'Polygon',
    coordinates: [
      [
        [lng - o, lat - o],
        [lng + o, lat - o],
        [lng + o, lat + o],
        [lng - o, lat + o],
        [lng - o, lat - o],
      ],
    ],
  };
}

export function areaColor(
  area: OperationAreaRow,
  index: number,
): string {
  if (area.type?.color) return area.type.color;
  const fallback = [
    '#1e73ae',
    '#c45c26',
    '#2d6a4f',
    '#7c3aed',
    '#b45309',
  ];
  return fallback[index % fallback.length] ?? '#1e73ae';
}
