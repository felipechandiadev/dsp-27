import { MigrationInterface, QueryRunner } from 'typeorm';

export class ManagedDocuments1760000000017 implements MigrationInterface {
  name = 'ManagedDocuments1760000000017';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE managed_documents (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar NOT NULL UNIQUE,
        title varchar NOT NULL,
        document_type_id uuid NULL REFERENCES document_types(id),
        status varchar NOT NULL DEFAULT 'draft',
        body_json jsonb NOT NULL DEFAULT '{}'::jsonb,
        body_html text NULL,
        created_by_user_id uuid NULL REFERENCES users(id),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX managed_documents_document_type_id_idx
      ON managed_documents (document_type_id)
    `);
    await queryRunner.query(`
      CREATE INDEX managed_documents_status_idx
      ON managed_documents (status)
      WHERE deleted_at IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS managed_documents_status_idx`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS managed_documents_document_type_id_idx`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS managed_documents`);
  }
}
