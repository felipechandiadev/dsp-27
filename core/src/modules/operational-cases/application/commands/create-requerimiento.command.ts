import type { CaseLocationGeometry } from '../../domain/location-geometry';

export type CreateRequerimientoInput = {
  descripcion: string;
  prioridad?: string;
  occurredAt?: string;
  lat?: number;
  lng?: number;
  locationDescription?: string;
  locationGeometry?: CaseLocationGeometry | null;
  areaId?: string;
  incidenciaId?: string;
  personaSolicitanteId?: string;
};

export class CreateRequerimientoCommand {
  constructor(
    public readonly actorRole: string,
    public readonly input: CreateRequerimientoInput,
  ) {}
}
