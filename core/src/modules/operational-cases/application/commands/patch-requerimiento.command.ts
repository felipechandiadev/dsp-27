export class PatchRequerimientoCommand {
  constructor(
    public readonly actorRole: string,
    public readonly code: string,
    public readonly input: {
      descripcion?: string;
      prioridad?: string;
      locationDescription?: string | null;
    },
  ) {}
}
