import { Inject, Injectable, Logger } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { MicrosoftTokenService } from '@modules/integrations/microsoft/application/microsoft-token.service';
import {
  MICROSOFT_GRAPH,
  MicrosoftGraphPort,
} from '@modules/integrations/microsoft/application/ports/microsoft-graph.port';
import {
  MailSenderPort,
  SendMailAsActorResult,
} from '../application/ports/mail-sender.port';

@Injectable()
export class ActorOutlookMailSender implements MailSenderPort {
  private readonly logger = new Logger(ActorOutlookMailSender.name);

  constructor(
    private readonly tokens: MicrosoftTokenService,
    @Inject(MICROSOFT_GRAPH)
    private readonly graph: MicrosoftGraphPort,
  ) {}

  async sendAsActor(input: {
    actorUserId: string;
    to: string;
    subject: string;
    bodyHtml: string;
  }): Promise<SendMailAsActorResult> {
    try {
      const accessToken = await this.tokens.getValidAccessToken(
        input.actorUserId,
      );
      await this.graph.sendMail(accessToken, {
        to: input.to,
        subject: input.subject,
        bodyHtml: input.bodyHtml,
      });
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        return { ok: false, reason: 'no_sender', error: err.message };
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`sendAsActor failed: ${message}`);
      return { ok: false, reason: 'send_failed', error: message };
    }
  }
}
