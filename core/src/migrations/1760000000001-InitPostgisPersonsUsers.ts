import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitPostgisPersonsUsers1760000000001
  implements MigrationInterface
{
  name = 'InitPostgisPersonsUsers1760000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE persons (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(16) UNIQUE,
        first_name varchar NOT NULL,
        last_name varchar NOT NULL,
        document_type varchar NOT NULL,
        document_number varchar NOT NULL,
        email varchar,
        phone varchar,
        address varchar,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz,
        CONSTRAINT uq_persons_document UNIQUE (document_type, document_number)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        persona_id uuid NOT NULL UNIQUE REFERENCES persons(id),
        username varchar NOT NULL UNIQUE,
        password_hash varchar NOT NULL,
        role varchar NOT NULL,
        status varchar NOT NULL DEFAULT 'active',
        last_login_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
    await queryRunner.query(`DROP TABLE IF EXISTS persons`);
  }
}
