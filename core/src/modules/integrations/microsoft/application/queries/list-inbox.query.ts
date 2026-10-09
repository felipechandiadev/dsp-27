export class ListInboxQuery {
  constructor(
    public readonly userId: string,
    public readonly top: number,
  ) {}
}
