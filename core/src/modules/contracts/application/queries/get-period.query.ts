export class GetPeriodQuery {
  constructor(
    public readonly contractCode: string,
    public readonly year: number,
    public readonly month: number,
  ) {}
}
