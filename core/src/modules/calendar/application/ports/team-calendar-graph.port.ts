export const TEAM_CALENDAR_GRAPH = Symbol('TEAM_CALENDAR_GRAPH');

export type GraphTeamEvent = {
  id: string;
  subject: string | null;
  start: string;
  end: string;
  allDay: boolean;
  location: string | null;
  isPrivate: boolean;
};

export interface TeamCalendarGraphPort {
  isConfigured(): boolean;
  listCalendarView(
    userEmail: string,
    fromIso: string,
    toIso: string,
  ): Promise<GraphTeamEvent[]>;
}
