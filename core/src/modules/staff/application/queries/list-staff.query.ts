export class ListStaffQuery {
  constructor(
    public readonly unit?: string,
    public readonly status?: string,
    public readonly inspectorQuality?: string,
    public readonly ds97Profile?: string,
  ) {}
}
