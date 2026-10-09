import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '@config/config.service';
import { GetMicrosoftStatusQuery } from '../queries/get-microsoft-status.query';
import {
  MICROSOFT_PROVIDER,
  OAUTH_ACCOUNT_REPOSITORY,
  OauthAccountRepositoryPort,
} from '../ports/oauth-account.repository.port';

@QueryHandler(GetMicrosoftStatusQuery)
export class GetMicrosoftStatusHandler
  implements IQueryHandler<GetMicrosoftStatusQuery>
{
  constructor(
    private readonly config: AppConfigService,
    @Inject(OAUTH_ACCOUNT_REPOSITORY)
    private readonly accounts: OauthAccountRepositoryPort,
  ) {}

  async execute(query: GetMicrosoftStatusQuery) {
    const configured = this.config.microsoft.configured;
    if (!configured) {
      return {
        configured: false,
        connected: false,
        accountEmail: null as string | null,
      };
    }
    const row = await this.accounts.findByUserAndProvider(
      query.userId,
      MICROSOFT_PROVIDER,
    );
    return {
      configured: true,
      connected: Boolean(row),
      accountEmail: row?.accountEmail ?? null,
    };
  }
}
