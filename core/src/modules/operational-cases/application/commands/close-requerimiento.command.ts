export class CloseRequerimientoCommand {
  constructor(
    public readonly actorRole: string,
    public readonly code: string,
    public readonly status: string,
    public readonly reason?: string,
  ) {}
}
