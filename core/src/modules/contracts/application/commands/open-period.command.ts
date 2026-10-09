export class OpenPeriodCommand {
  constructor(
    public readonly actorUserId: string,
    public readonly actorRole: string,
    public readonly contractCode: string,
    public readonly year: number,
    public readonly month: number,
  ) {}
}
