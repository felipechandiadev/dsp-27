export class CertifyPeriodCommand {
  constructor(
    public readonly actorUserId: string,
    public readonly actorRole: string,
    public readonly periodId: string,
    public readonly notes?: string | null,
  ) {}
}
