export class ListOperationsQuery {
  constructor(
    public readonly activeOnly?: boolean,
    public readonly limit?: number,
  ) {}
}
