export class PatchIncidenciaVerificationCommand {
  constructor(
    public readonly actorRole: string,
    public readonly code: string,
    public readonly status: string,
  ) {}
}
