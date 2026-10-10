import type { GeoJsonPolygon } from '@modules/territory/domain/geojson';

export type CreateAreaPayload = {
  name: string;
  typeId: string;
  parentId?: string | null;
  geometry: GeoJsonPolygon;
  notes?: string | null;
  status?: string;
};

export class CreateAreaCommand {
  constructor(
    public readonly actorRole: string,
    public readonly input: CreateAreaPayload,
  ) {}
}
