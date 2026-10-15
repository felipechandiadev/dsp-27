export class CreatePreventivePatrolCommand {
  constructor(
    public readonly actorRole: string,
    public readonly actorUserId: string | null,
    public readonly payload: Record<string, unknown>,
  ) {}
}
