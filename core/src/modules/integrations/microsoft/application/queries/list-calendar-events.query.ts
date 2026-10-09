export class ListCalendarEventsQuery {
  constructor(
    public readonly userId: string,
    public readonly top: number,
  ) {}
}
