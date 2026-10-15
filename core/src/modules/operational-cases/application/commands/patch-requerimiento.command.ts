import type { CaseLocationGeometry } from '../../domain/location-geometry';

export class PatchRequerimientoCommand {
  constructor(
    public readonly actorRole: string,
    public readonly code: string,
    public readonly input: {
      descripcion?: string;
      prioridad?: string;
      locationDescription?: string | null;
      lat?: number | null;
      lng?: number | null;
      locationGeometry?: CaseLocationGeometry | null;
    },
  ) {}
}
