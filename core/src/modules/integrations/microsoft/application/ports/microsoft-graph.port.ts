export const MICROSOFT_GRAPH = Symbol('MICROSOFT_GRAPH');

export type GraphProfile = {
  id: string;
  displayName?: string;
  mail?: string | null;
  userPrincipalName?: string;
};

export type GraphMailMessage = {
  id: string;
  subject: string | null;
  from: string | null;
  receivedDateTime: string | null;
  bodyPreview: string | null;
};

export type GraphCalendarEvent = {
  id: string;
  subject: string | null;
  start: string | null;
  end: string | null;
  location: string | null;
};

export interface MicrosoftGraphPort {
  getProfile(accessToken: string): Promise<GraphProfile>;
  listInbox(
    accessToken: string,
    top: number,
  ): Promise<GraphMailMessage[]>;
  sendMail(
    accessToken: string,
    input: { to: string; subject: string; bodyHtml: string },
  ): Promise<void>;
  listEvents(
    accessToken: string,
    top: number,
  ): Promise<GraphCalendarEvent[]>;
}
