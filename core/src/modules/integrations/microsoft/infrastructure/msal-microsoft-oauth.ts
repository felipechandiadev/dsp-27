import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AppConfigService } from '@config/config.service';
import {
  MicrosoftOauthPort,
  MicrosoftTokenSet,
} from '../application/ports/microsoft-oauth.port';

type TokenEndpointResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};

@Injectable()
export class MsalMicrosoftOauth implements MicrosoftOauthPort {
  constructor(private readonly config: AppConfigService) {}

  isConfigured(): boolean {
    return this.config.microsoft.configured;
  }

  private assertConfigured(): void {
    const ms = this.config.microsoft;
    if (!ms.configured || !ms.clientSecret || !ms.redirectUri) {
      throw new ServiceUnavailableException(
        'Integración Microsoft no configurada',
      );
    }
  }

  private tokenEndpoint(): string {
    const { tenantId } = this.config.microsoft;
    return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  }

  private authorizeEndpoint(): string {
    const { tenantId } = this.config.microsoft;
    return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`;
  }

  getAuthorizationUrl(state: string): string {
    this.assertConfigured();
    const ms = this.config.microsoft;
    const params = new URLSearchParams({
      client_id: ms.clientId,
      response_type: 'code',
      redirect_uri: ms.redirectUri,
      response_mode: 'query',
      scope: ms.scopes.join(' '),
      state,
      prompt: 'select_account',
    });
    return `${this.authorizeEndpoint()}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<MicrosoftTokenSet> {
    this.assertConfigured();
    const ms = this.config.microsoft;
    const body = new URLSearchParams({
      client_id: ms.clientId,
      client_secret: ms.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: ms.redirectUri,
      scope: ms.scopes.join(' '),
    });
    return this.postToken(body);
  }

  async refreshAccessToken(refreshToken: string): Promise<MicrosoftTokenSet> {
    this.assertConfigured();
    const ms = this.config.microsoft;
    const body = new URLSearchParams({
      client_id: ms.clientId,
      client_secret: ms.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: ms.scopes.join(' '),
    });
    return this.postToken(body, refreshToken);
  }

  private async postToken(
    body: URLSearchParams,
    fallbackRefresh?: string,
  ): Promise<MicrosoftTokenSet> {
    const res = await fetch(this.tokenEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = (await res.json()) as TokenEndpointResponse;
    if (!res.ok || !data.access_token) {
      throw new ServiceUnavailableException(
        data.error_description ||
          data.error ||
          'Error al obtener token de Microsoft',
      );
    }
    const refresh = data.refresh_token || fallbackRefresh;
    if (!refresh) {
      throw new ServiceUnavailableException(
        'Microsoft no devolvió refresh_token (revisa offline_access)',
      );
    }
    const expiresIn = data.expires_in ?? 3600;
    return {
      accessToken: data.access_token,
      refreshToken: refresh,
      expiresOn: new Date(Date.now() + expiresIn * 1000),
      scopes: data.scope ? data.scope.split(' ') : [...this.config.microsoft.scopes],
    };
  }
}
