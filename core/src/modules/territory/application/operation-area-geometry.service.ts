import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { GeoJsonPolygon } from '../domain/geojson';

type GeometryRow = {
  geojson: GeoJsonPolygon | null;
};

@Injectable()
export class OperationAreaGeometryService {
  constructor(private readonly dataSource: DataSource) {}

  validatePolygon(geometry: GeoJsonPolygon): void {
    if (geometry?.type !== 'Polygon') {
      throw new BadRequestException('geometry debe ser un Polygon GeoJSON');
    }
    const ring = geometry.coordinates?.[0];
    if (!ring || ring.length < 4) {
      throw new BadRequestException(
        'El polígono debe tener al menos 4 puntos',
      );
    }
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      throw new BadRequestException(
        'El anillo del polígono debe estar cerrado',
      );
    }
  }

  async readGeometry(areaId: string): Promise<GeoJsonPolygon | null> {
    const rows = await this.dataSource.query<GeometryRow[]>(
      `
      SELECT ST_AsGeoJSON(geom)::json AS geojson
      FROM operation_areas
      WHERE id = $1 AND deleted_at IS NULL
      `,
      [areaId],
    );
    const geojson = rows[0]?.geojson;
    if (!geojson || geojson.type !== 'Polygon') {
      return null;
    }
    return geojson;
  }

  async writeGeometry(
    areaId: string,
    geometry: GeoJsonPolygon,
  ): Promise<void> {
    this.validatePolygon(geometry);
    await this.dataSource.query(
      `
      UPDATE operation_areas
      SET geom = ST_SetSRID(ST_GeomFromGeoJSON($2), 4326)::geography,
          updated_at = now()
      WHERE id = $1 AND deleted_at IS NULL
      `,
      [areaId, JSON.stringify(geometry)],
    );
  }

  async insertWithGeometry(input: {
    id: string;
    code: string;
    name: string;
    typeId: string;
    parentId: string | null;
    status: string;
    notes: string | null;
    geometry: GeoJsonPolygon;
  }): Promise<void> {
    this.validatePolygon(input.geometry);
    await this.dataSource.query(
      `
      INSERT INTO operation_areas (
        id, code, name, type_id, parent_id, geom, status, notes
      ) VALUES (
        $1, $2, $3, $4, $5,
        ST_SetSRID(ST_GeomFromGeoJSON($6), 4326)::geography,
        $7, $8
      )
      `,
      [
        input.id,
        input.code,
        input.name,
        input.typeId,
        input.parentId,
        JSON.stringify(input.geometry),
        input.status,
        input.notes,
      ],
    );
  }
}
