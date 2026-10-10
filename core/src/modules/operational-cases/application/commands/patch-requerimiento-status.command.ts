export class PatchRequerimientoStatusCommand {
  constructor(
    public readonly actorRole: string,
    public readonly code: string,
    public readonly status: string,
  ) {}
}
