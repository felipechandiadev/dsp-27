import { MigrationInterface, QueryRunner } from 'typeorm';

export class DocumentTypes1760000000013 implements MigrationInterface {
  name = 'DocumentTypes1760000000013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE document_types (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar NOT NULL UNIQUE,
        name varchar NOT NULL,
        description text NULL,
        sort_order int NOT NULL DEFAULT 0,
        status varchar NOT NULL DEFAULT 'active',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS document_types`);
  }
}
