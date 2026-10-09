import { Injectable } from '@nestjs/common';
import 'isomorphic-fetch';
import { Client } from '@microsoft/microsoft-graph-client';
import {
  GraphCalendarEvent,
  GraphMailMessage,
  GraphProfile,
  MicrosoftGraphPort,
} from '../application/ports/microsoft-graph.port';

@Injectable()
export class GraphMicrosoftClient implements MicrosoftGraphPort {
  private client(accessToken: string): Client {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  async getProfile(accessToken: string): Promise<GraphProfile> {
    const me = (await this.client(accessToken)
      .api('/me')
      .select('id,displayName,mail,userPrincipalName')
      .get()) as GraphProfile;
    return me;
  }

  async listInbox(
    accessToken: string,
    top: number,
  ): Promise<GraphMailMessage[]> {
    const result = (await this.client(accessToken)
      .api('/me/mailFolders/inbox/messages')
      .select('id,subject,from,receivedDateTime,bodyPreview')
      .top(top)
      .orderby('receivedDateTime desc')
      .get()) as {
      value?: Array<{
        id: string;
        subject?: string;
        from?: { emailAddress?: { address?: string; name?: string } };
        receivedDateTime?: string;
        bodyPreview?: string;
      }>;
    };

    return (result.value ?? []).map((m) => ({
      id: m.id,
      subject: m.subject ?? null,
      from:
        m.from?.emailAddress?.address ||
        m.from?.emailAddress?.name ||
        null,
      receivedDateTime: m.receivedDateTime ?? null,
      bodyPreview: m.bodyPreview ?? null,
    }));
  }

  async sendMail(
    accessToken: string,
    input: { to: string; subject: string; bodyHtml: string },
  ): Promise<void> {
    await this.client(accessToken).api('/me/sendMail').post({
      message: {
        subject: input.subject,
        body: {
          contentType: 'HTML',
          content: input.bodyHtml,
        },
        toRecipients: [
          {
            emailAddress: { address: input.to },
          },
        ],
      },
      saveToSentItems: true,
    });
  }

  async listEvents(
    accessToken: string,
    top: number,
  ): Promise<GraphCalendarEvent[]> {
    const result = (await this.client(accessToken)
      .api('/me/events')
      .select('id,subject,start,end,location')
      .top(top)
      .orderby('start/dateTime')
      .get()) as {
      value?: Array<{
        id: string;
        subject?: string;
        start?: { dateTime?: string };
        end?: { dateTime?: string };
        location?: { displayName?: string };
      }>;
    };

    return (result.value ?? []).map((e) => ({
      id: e.id,
      subject: e.subject ?? null,
      start: e.start?.dateTime ?? null,
      end: e.end?.dateTime ?? null,
      location: e.location?.displayName ?? null,
    }));
  }
}
