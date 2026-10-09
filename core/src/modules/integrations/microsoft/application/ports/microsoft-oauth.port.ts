export const MICROSOFT_OAUTH = Symbol('MICROSOFT_OAUTH');

export type MicrosoftTokenSet = {
  accessToken: string;
  refreshToken: string;
  expiresOn: Date;
  scopes: string[];
};

export interface MicrosoftOauthPort {
  isConfigured(): boolean;
  getAuthorizationUrl(state: string): string;
  exchangeCode(code: string): Promise<MicrosoftTokenSet>;
  refreshAccessToken(refreshToken: string): Promise<MicrosoftTokenSet>;
}
