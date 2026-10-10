import type { GeoJsonPolygon } from '@modules/territory/domain/geojson';

export type UpdateAreaPayload = {
  name?: string;
  typeId?: string;
  parentId?: string | null;
  geometry?: GeoJsonPolygon;
  notes?: string | null;
  status?: string;
};

export class UpdateAreaCommand {
  constructor(
    public readonly actorRole: string,
    public readonly code: string,
    public readonly input: UpdateAreaPayload,
  ) {}
}
