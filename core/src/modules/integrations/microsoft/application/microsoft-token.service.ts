import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  MICROSOFT_PROVIDER,
  OAUTH_ACCOUNT_REPOSITORY,
  OauthAccountRepositoryPort,
} from './ports/oauth-account.repository.port';
import {
  MICROSOFT_OAUTH,
  MicrosoftOauthPort,
} from './ports/microsoft-oauth.port';
import { TOKEN_CRYPTO, TokenCryptoPort } from './ports/token-crypto.port';

const REFRESH_SKEW_MS = 5 * 60 * 1000;

@Injectable()
export class MicrosoftTokenService {
  constructor(
    @Inject(OAUTH_ACCOUNT_REPOSITORY)
    private readonly accounts: OauthAccountRepositoryPort,
    @Inject(MICROSOFT_OAUTH)
    private readonly oauth: MicrosoftOauthPort,
    @Inject(TOKEN_CRYPTO)
    private readonly crypto: TokenCryptoPort,
  ) {}

  async getValidAccessToken(userId: string): Promise<string> {
    const row = await this.accounts.findByUserAndProvider(
      userId,
      MICROSOFT_PROVIDER,
    );
    if (!row) {
      throw new UnauthorizedException(
        'Outlook no conectado. Conecta tu cuenta en Ajustes.',
      );
    }

    const now = Date.now();
    if (row.expiresAt.getTime() - REFRESH_SKEW_MS > now) {
      return this.crypto.decrypt(row.accessTokenEnc);
    }

    try {
      const refreshed = await this.oauth.refreshAccessToken(
        this.crypto.decrypt(row.refreshTokenEnc),
      );
      await this.accounts.upsertMicrosoft({
        userId,
        accountEmail: row.accountEmail,
        accessTokenEnc: this.crypto.encrypt(refreshed.accessToken),
        refreshTokenEnc: this.crypto.encrypt(refreshed.refreshToken),
        expiresAt: refreshed.expiresOn,
        scopes: refreshed.scopes.join(' '),
      });
      return refreshed.accessToken;
    } catch {
      throw new UnauthorizedException(
        'Sesión de Outlook expirada. Vuelve a conectar Outlook.',
      );
    }
  }
}
