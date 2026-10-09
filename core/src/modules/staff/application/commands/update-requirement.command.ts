export class UpdateRequirementCommand {
  constructor(
    public readonly actorUserId: string,
    public readonly actorRole: string,
    public readonly code: string,
    public readonly requirementCode: string,
    public readonly status: string,
    public readonly notes?: string,
  ) {}
}
