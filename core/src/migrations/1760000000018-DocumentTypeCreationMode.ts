import { MigrationInterface, QueryRunner } from 'typeorm';

export class DocumentTypeCreationMode1760000000018
  implements MigrationInterface
{
  name = 'DocumentTypeCreationMode1760000000018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE document_types
      ADD COLUMN IF NOT EXISTS creation_mode varchar NOT NULL DEFAULT 'attachment'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE document_types
      DROP COLUMN IF EXISTS creation_mode
    `);
  }
}
