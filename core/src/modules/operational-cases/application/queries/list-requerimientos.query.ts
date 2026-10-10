export class ListRequerimientosQuery {
  constructor(
    public readonly openOnly?: boolean,
    public readonly limit?: number,
  ) {}
}
