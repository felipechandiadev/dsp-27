import { MigrationInterface, QueryRunner } from 'typeorm';

export class ManagedDocumentBodyAsset1760000000020
  implements MigrationInterface
{
  name = 'ManagedDocumentBodyAsset1760000000020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE managed_documents
      ADD COLUMN IF NOT EXISTS body_asset_id uuid
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_managed_documents_body_asset
      ON managed_documents (body_asset_id)
      WHERE body_asset_id IS NOT NULL AND deleted_at IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_managed_documents_body_asset
    `);
    await queryRunner.query(`
      ALTER TABLE managed_documents
      DROP COLUMN IF EXISTS body_asset_id
    `);
  }
}
