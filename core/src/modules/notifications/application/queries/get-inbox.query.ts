export class GetInboxQuery {
  constructor(
    public readonly userId: string,
    public readonly limit: number,
  ) {}
}
