import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type {
  CaseLocationGeometry,
  CaseLocationTable,
  GeoJsonLineString,
  GeoJsonPoint,
  GeoJsonPolygon,
} from '../domain/location-geometry';

type GeometryRow = {
  id: string;
  geojson: CaseLocationGeometry | null;
};

@Injectable()
export class CaseLocationGeometryService {
  constructor(private readonly dataSource: DataSource) {}

  validate(geometry: CaseLocationGeometry): void {
    if (!geometry?.type) {
      throw new BadRequestException('locationGeometry inválida');
    }
    if (geometry.type === 'Point') {
      this.validatePoint(geometry as GeoJsonPoint);
      return;
    }
    if (geometry.type === 'LineString') {
      this.validateLineString(geometry as GeoJsonLineString);
      return;
    }
    if (geometry.type === 'Polygon') {
      this.validatePolygon(geometry as GeoJsonPolygon);
      return;
    }
    throw new BadRequestException(
      'locationGeometry debe ser Point, LineString o Polygon',
    );
  }

  pointFromLatLng(lat: number, lng: number): CaseLocationGeometry {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new BadRequestException('lat/lng inválidos');
    }
    return { type: 'Point', coordinates: [lng, lat] };
  }

  coordsFromGeometry(
    geometry: CaseLocationGeometry | null,
  ): { lat: number | null; lng: number | null } {
    if (geometry?.type === 'Point') {
      const coords = geometry.coordinates as number[];
      const lng = coords[0];
      const lat = coords[1];
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat: lat as number, lng: lng as number };
      }
    }
    return { lat: null, lng: null };
  }

  async read(
    table: CaseLocationTable,
    id: string,
  ): Promise<CaseLocationGeometry | null> {
    const rows = await this.dataSource.query<GeometryRow[]>(
      `
      SELECT id, ST_AsGeoJSON(location_geom)::json AS geojson
      FROM ${table}
      WHERE id = $1 AND deleted_at IS NULL
      `,
      [id],
    );
    return this.normalize(rows[0]?.geojson ?? null);
  }

  async readMany(
    table: CaseLocationTable,
    ids: string[],
  ): Promise<Map<string, CaseLocationGeometry | null>> {
    const map = new Map<string, CaseLocationGeometry | null>();
    if (ids.length === 0) return map;
    const rows = await this.dataSource.query<GeometryRow[]>(
      `
      SELECT id, ST_AsGeoJSON(location_geom)::json AS geojson
      FROM ${table}
      WHERE id = ANY($1::uuid[]) AND deleted_at IS NULL
      `,
      [ids],
    );
    for (const row of rows) {
      map.set(row.id, this.normalize(row.geojson));
    }
    return map;
  }

  async write(
    table: CaseLocationTable,
    id: string,
    geometry: CaseLocationGeometry | null,
  ): Promise<void> {
    if (geometry == null) {
      await this.dataSource.query(
        `
        UPDATE ${table}
        SET location_geom = NULL, updated_at = now()
        WHERE id = $1 AND deleted_at IS NULL
        `,
        [id],
      );
      return;
    }
    this.validate(geometry);
    await this.dataSource.query(
      `
      UPDATE ${table}
      SET location_geom = ST_SetSRID(ST_GeomFromGeoJSON($2), 4326)::geography,
          updated_at = now()
      WHERE id = $1 AND deleted_at IS NULL
      `,
      [id, JSON.stringify(geometry)],
    );
  }

  private normalize(
    geojson: CaseLocationGeometry | null,
  ): CaseLocationGeometry | null {
    if (!geojson) return null;
    if (
      geojson.type === 'Point' ||
      geojson.type === 'LineString' ||
      geojson.type === 'Polygon'
    ) {
      return geojson;
    }
    return null;
  }

  private validatePoint(geometry: GeoJsonPoint): void {
    const coords = geometry.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) {
      throw new BadRequestException('Point requiere [lng, lat]');
    }
    const [lng, lat] = coords;
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      throw new BadRequestException('Point con coordenadas inválidas');
    }
  }

  private validateLineString(geometry: GeoJsonLineString): void {
    const coords = geometry.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) {
      throw new BadRequestException(
        'LineString debe tener al menos 2 puntos',
      );
    }
    for (const pair of coords) {
      if (
        !Array.isArray(pair) ||
        pair.length < 2 ||
        !Number.isFinite(pair[0]) ||
        !Number.isFinite(pair[1])
      ) {
        throw new BadRequestException('LineString con coordenadas inválidas');
      }
    }
  }

  private validatePolygon(geometry: GeoJsonPolygon): void {
    const ring = geometry.coordinates?.[0];
    if (!ring || ring.length < 4) {
      throw new BadRequestException(
        'El polígono debe tener al menos 4 puntos',
      );
    }
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (
      !first ||
      !last ||
      first[0] !== last[0] ||
      first[1] !== last[1]
    ) {
      throw new BadRequestException(
        'El anillo del polígono debe estar cerrado',
      );
    }
  }
}
