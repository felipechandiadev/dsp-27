import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '@config/config.service';
import { HandleMicrosoftCallbackCommand } from '../commands/handle-microsoft-callback.command';
import {
  MICROSOFT_OAUTH,
  MicrosoftOauthPort,
} from '../ports/microsoft-oauth.port';
import {
  MICROSOFT_GRAPH,
  MicrosoftGraphPort,
} from '../ports/microsoft-graph.port';
import {
  OAUTH_ACCOUNT_REPOSITORY,
  OauthAccountRepositoryPort,
} from '../ports/oauth-account.repository.port';
import { TOKEN_CRYPTO, TokenCryptoPort } from '../ports/token-crypto.port';

@CommandHandler(HandleMicrosoftCallbackCommand)
export class HandleMicrosoftCallbackHandler
  implements ICommandHandler<HandleMicrosoftCallbackCommand>
{
  constructor(
    private readonly config: AppConfigService,
    private readonly jwt: JwtService,
    @Inject(MICROSOFT_OAUTH)
    private readonly oauth: MicrosoftOauthPort,
    @Inject(MICROSOFT_GRAPH)
    private readonly graph: MicrosoftGraphPort,
    @Inject(OAUTH_ACCOUNT_REPOSITORY)
    private readonly accounts: OauthAccountRepositoryPort,
    @Inject(TOKEN_CRYPTO)
    private readonly crypto: TokenCryptoPort,
  ) {}

  async execute(command: HandleMicrosoftCallbackCommand): Promise<string> {
    const base =
      this.config.microsoft.appRedirectUri || 'http://localhost:5081/settings';
    const redirect = (outlook: string) => {
      const url = new URL(base);
      url.searchParams.set('outlook', outlook);
      return url.toString();
    };

    if (command.error || !command.code || !command.state) {
      return redirect('error');
    }

    try {
      const payload = await this.jwt.verifyAsync<{
        sub: string;
        purpose?: string;
      }>(command.state);
      if (payload.purpose !== 'ms-oauth' || !payload.sub) {
        return redirect('error');
      }

      const tokens = await this.oauth.exchangeCode(command.code);
      const profile = await this.graph.getProfile(tokens.accessToken);
      const accountEmail =
        profile.mail || profile.userPrincipalName || null;

      await this.accounts.upsertMicrosoft({
        userId: payload.sub,
        accountEmail,
        accessTokenEnc: this.crypto.encrypt(tokens.accessToken),
        refreshTokenEnc: this.crypto.encrypt(tokens.refreshToken),
        expiresAt: tokens.expiresOn,
        scopes: tokens.scopes.join(' '),
      });

      return redirect('connected');
    } catch {
      return redirect('error');
    }
  }
}
