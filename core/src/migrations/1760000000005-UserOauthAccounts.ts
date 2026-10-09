import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserOauthAccounts1760000000005 implements MigrationInterface {
  name = 'UserOauthAccounts1760000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE user_oauth_accounts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id),
        provider varchar NOT NULL,
        account_email varchar,
        access_token_enc text NOT NULL,
        refresh_token_enc text NOT NULL,
        expires_at timestamptz NOT NULL,
        scopes text NOT NULL DEFAULT '',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_user_oauth_accounts_user_provider UNIQUE (user_id, provider)
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_user_oauth_accounts_provider
        ON user_oauth_accounts (provider)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS user_oauth_accounts`);
  }
}
