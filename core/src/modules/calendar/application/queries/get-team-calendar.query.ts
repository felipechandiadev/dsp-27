import { CalendarLayer } from '../../domain/team-calendar.types';

export class GetTeamCalendarQuery {
  constructor(
    public readonly from: string,
    public readonly to: string,
    public readonly personIds: string[] | null,
    public readonly layers: CalendarLayer[],
  ) {}
}
