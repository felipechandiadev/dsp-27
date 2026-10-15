export type CaseLocationGeometry = {
  type: 'Point' | 'LineString' | 'Polygon';
  coordinates: number[] | number[][] | number[][][];
};

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

export type CaseLocationTable =
  | 'incidencias'
  | 'requerimientos'
  | 'field_operations';
