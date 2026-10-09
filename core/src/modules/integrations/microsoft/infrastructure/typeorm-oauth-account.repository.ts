import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOauthAccount } from '../domain/user-oauth-account.entity';
import {
  MICROSOFT_PROVIDER,
  OauthAccountRepositoryPort,
  UpsertMicrosoftTokensInput,
} from '../application/ports/oauth-account.repository.port';

@Injectable()
export class TypeOrmOauthAccountRepository
  implements OauthAccountRepositoryPort
{
  constructor(
    @InjectRepository(UserOauthAccount)
    private readonly repo: Repository<UserOauthAccount>,
  ) {}

  findByUserAndProvider(
    userId: string,
    provider: string,
  ): Promise<UserOauthAccount | null> {
    return this.repo.findOne({ where: { userId, provider } });
  }

  async upsertMicrosoft(
    input: UpsertMicrosoftTokensInput,
  ): Promise<UserOauthAccount> {
    let row = await this.findByUserAndProvider(
      input.userId,
      MICROSOFT_PROVIDER,
    );
    if (!row) {
      row = this.repo.create({
        userId: input.userId,
        provider: MICROSOFT_PROVIDER,
      });
    }
    row.accountEmail = input.accountEmail;
    row.accessTokenEnc = input.accessTokenEnc;
    row.refreshTokenEnc = input.refreshTokenEnc;
    row.expiresAt = input.expiresAt;
    row.scopes = input.scopes;
    return this.repo.save(row);
  }

  async deleteByUserAndProvider(
    userId: string,
    provider: string,
  ): Promise<void> {
    await this.repo.delete({ userId, provider });
  }
}
