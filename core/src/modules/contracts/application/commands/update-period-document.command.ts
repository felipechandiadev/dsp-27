export class UpdatePeriodDocumentCommand {
  constructor(
    public readonly actorUserId: string,
    public readonly actorRole: string,
    public readonly periodId: string,
    public readonly docType: string,
    public readonly status: string,
    public readonly notes?: string | null,
  ) {}
}
