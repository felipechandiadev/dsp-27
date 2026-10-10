export class PatchIncidenciaCommand {
  constructor(
    public readonly actorRole: string,
    public readonly code: string,
    public readonly input: {
      title?: string;
      descripcion?: string | null;
      incidentTypeId?: string | null;
      locationDescription?: string | null;
    },
  ) {}
}
