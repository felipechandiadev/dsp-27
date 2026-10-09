import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '@config/config.service';
import {
  GraphTeamEvent,
  TeamCalendarGraphPort,
} from '../application/ports/team-calendar-graph.port';

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

@Injectable()
export class AppOnlyTeamCalendarGraph implements TeamCalendarGraphPort {
  private readonly logger = new Logger(AppOnlyTeamCalendarGraph.name);
  private cachedToken: { value: string; expiresAt: number } | null = null;

  constructor(private readonly config: AppConfigService) {}

  isConfigured(): boolean {
    const ms = this.config.microsoft;
    return Boolean(
      ms.appOnlyCalendar && ms.clientId && ms.clientSecret && ms.tenantId,
    );
  }

  private async getAppToken(): Promise<string> {
    if (
      this.cachedToken &&
      this.cachedToken.expiresAt > Date.now() + 60_000
    ) {
      return this.cachedToken.value;
    }
    const ms = this.config.microsoft;
    const body = new URLSearchParams({
      client_id: ms.clientId,
      client_secret: ms.clientSecret,
      grant_type: 'client_credentials',
      scope: 'https://graph.microsoft.com/.default',
    });
    const res = await fetch(
      `https://login.microsoftonline.com/${ms.tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      },
    );
    const data = (await res.json()) as TokenResponse;
    if (!res.ok || !data.access_token) {
      throw new Error(
        data.error_description || data.error || 'No app token for Graph',
      );
    }
    this.cachedToken = {
      value: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    };
    return data.access_token;
  }

  async listCalendarView(
    userEmail: string,
    fromIso: string,
    toIso: string,
  ): Promise<GraphTeamEvent[]> {
    const token = await this.getAppToken();
    const start = `${fromIso}T00:00:00`;
    const end = `${toIso}T23:59:59`;
    const url = new URL(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(userEmail)}/calendarView`,
    );
    url.searchParams.set('startDateTime', start);
    url.searchParams.set('endDateTime', end);
    url.searchParams.set('$top', '100');
    url.searchParams.set(
      '$select',
      'id,subject,start,end,isAllDay,location,sensitivity,isCancelled',
    );
    url.searchParams.set('$orderby', 'start/dateTime');

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Prefer: 'outlook.timezone="America/Santiago"',
      },
    });
    if (!res.ok) {
      const text = await res.text();
      this.logger.debug(`calendarView ${userEmail}: ${res.status} ${text}`);
      throw new Error(`Graph ${res.status} for ${userEmail}`);
    }
    const data = (await res.json()) as {
      value?: Array<{
        id: string;
        subject?: string;
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
        isAllDay?: boolean;
        location?: { displayName?: string };
        sensitivity?: string;
        isCancelled?: boolean;
      }>;
    };

    return (data.value ?? [])
      .filter((e) => !e.isCancelled)
      .map((e) => {
        const sensitivity = (e.sensitivity || 'normal').toLowerCase();
        const isPrivate =
          sensitivity === 'private' || sensitivity === 'confidential';
        const start =
          e.start?.dateTime || e.start?.date || `${fromIso}T00:00:00`;
        const endVal = e.end?.dateTime || e.end?.date || start;
        return {
          id: e.id,
          subject: e.subject ?? null,
          start,
          end: endVal,
          allDay: Boolean(e.isAllDay),
          location: e.location?.displayName ?? null,
          isPrivate,
        };
      });
  }
}
