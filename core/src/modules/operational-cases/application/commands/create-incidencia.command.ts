export type CreateIncidenciaInput = {
  title: string;
  descripcion?: string;
  incidentTypeId?: string;
  occurredAt?: string;
  lat?: number;
  lng?: number;
  locationDescription?: string;
  areaId?: string;
  requerimientoId?: string;
  ingressChannel?: string;
  registrationOrigin?: string;
};

export class CreateIncidenciaCommand {
  constructor(
    public readonly actorRole: string,
    public readonly input: CreateIncidenciaInput,
  ) {}
}
