import { MigrationInterface, QueryRunner } from 'typeorm';

export class MultimediaAssets1760000000009 implements MigrationInterface {
  name = 'MultimediaAssets1760000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE multimedia_assets (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type varchar NOT NULL,
        entity_id uuid NOT NULL,
        kind varchar NOT NULL,
        mime_type varchar NOT NULL,
        original_name varchar NOT NULL,
        storage_key varchar NOT NULL,
        storage_driver varchar NOT NULL,
        byte_size int NOT NULL,
        checksum varchar,
        classification varchar NOT NULL DEFAULT 'interno',
        sort_order int NOT NULL DEFAULT 0,
        uploaded_by_user_id uuid REFERENCES users(id),
        created_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_multimedia_entity
        ON multimedia_assets (entity_type, entity_id, sort_order)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS multimedia_assets`);
  }
}
