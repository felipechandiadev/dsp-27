import { UserOauthAccount } from '../../domain/user-oauth-account.entity';

export const OAUTH_ACCOUNT_REPOSITORY = Symbol('OAUTH_ACCOUNT_REPOSITORY');

export const MICROSOFT_PROVIDER = 'microsoft';

export type UpsertMicrosoftTokensInput = {
  userId: string;
  accountEmail: string | null;
  accessTokenEnc: string;
  refreshTokenEnc: string;
  expiresAt: Date;
  scopes: string;
};

export interface OauthAccountRepositoryPort {
  findByUserAndProvider(
    userId: string,
    provider: string,
  ): Promise<UserOauthAccount | null>;
  upsertMicrosoft(input: UpsertMicrosoftTokensInput): Promise<UserOauthAccount>;
  deleteByUserAndProvider(userId: string, provider: string): Promise<void>;
}
