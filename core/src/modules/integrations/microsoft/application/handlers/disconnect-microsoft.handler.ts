import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DisconnectMicrosoftCommand } from '../commands/disconnect-microsoft.command';
import {
  MICROSOFT_PROVIDER,
  OAUTH_ACCOUNT_REPOSITORY,
  OauthAccountRepositoryPort,
} from '../ports/oauth-account.repository.port';

@CommandHandler(DisconnectMicrosoftCommand)
export class DisconnectMicrosoftHandler
  implements ICommandHandler<DisconnectMicrosoftCommand>
{
  constructor(
    @Inject(OAUTH_ACCOUNT_REPOSITORY)
    private readonly accounts: OauthAccountRepositoryPort,
  ) {}

  async execute(command: DisconnectMicrosoftCommand) {
    await this.accounts.deleteByUserAndProvider(
      command.userId,
      MICROSOFT_PROVIDER,
    );
    return { disconnected: true };
  }
}
