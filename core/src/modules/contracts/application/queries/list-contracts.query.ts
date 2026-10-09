export class ListContractsQuery {
  constructor(
    public readonly kind?: string,
    public readonly status?: string,
  ) {}
}
