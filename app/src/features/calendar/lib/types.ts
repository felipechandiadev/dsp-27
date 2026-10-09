export type CalendarPerson = {
  userId: string;
  personaId: string;
  displayName: string;
  email: string | null;
  outlookEligible: boolean;
};

export type TeamCalendarEvent = {
  id: string;
  layer: 'dsp' | 'outlook';
  personId: string;
  userId: string | null;
  displayName: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location: string | null;
  busyOnly: boolean;
  sourceRef: Record<string, string>;
};

export type TeamCalendarResponse = {
  from: string;
  to: string;
  outlookConfigured: boolean;
  events: TeamCalendarEvent[];
  warnings: string[];
};
