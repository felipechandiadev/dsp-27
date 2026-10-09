export type CalendarLayer = 'dsp' | 'outlook';

export type TeamCalendarEvent = {
  id: string;
  layer: CalendarLayer;
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

export type CalendarPerson = {
  userId: string;
  personaId: string;
  displayName: string;
  email: string | null;
  outlookEligible: boolean;
};
