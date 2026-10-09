import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendMailCommand } from '../commands/send-mail.command';
import {
  MICROSOFT_GRAPH,
  MicrosoftGraphPort,
} from '../ports/microsoft-graph.port';
import { MicrosoftTokenService } from '../microsoft-token.service';

@CommandHandler(SendMailCommand)
export class SendMailHandler implements ICommandHandler<SendMailCommand> {
  constructor(
    private readonly tokens: MicrosoftTokenService,
    @Inject(MICROSOFT_GRAPH)
    private readonly graph: MicrosoftGraphPort,
  ) {}

  async execute(command: SendMailCommand) {
    const accessToken = await this.tokens.getValidAccessToken(command.userId);
    await this.graph.sendMail(accessToken, {
      to: command.to,
      subject: command.subject,
      bodyHtml: command.bodyHtml,
    });
    return { sent: true };
  }
}
