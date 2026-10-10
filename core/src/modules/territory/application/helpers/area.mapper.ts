import { OperationArea } from '@modules/territory/domain/operation-area.entity';
import { OperationAreaType } from '@modules/territory/domain/operation-area-type.entity';
import type { GeoJsonPolygon } from '@modules/territory/domain/geojson';

export function mapAreaType(t: OperationAreaType) {
  return {
    id: t.id,
    code: t.code,
    name: t.name,
    description: t.description,
    color: t.color,
    sortOrder: t.sortOrder,
    status: t.status,
  };
}

export function mapArea(
  a: OperationArea,
  geometry: GeoJsonPolygon | null,
) {
  return {
    id: a.id,
    code: a.code,
    name: a.name,
    typeId: a.typeId,
    parentId: a.parentId,
    status: a.status,
    notes: a.notes,
    geometry,
    type: a.type
      ? {
          id: a.type.id,
          code: a.type.code,
          name: a.type.name,
          color: a.type.color,
        }
      : null,
  };
}
