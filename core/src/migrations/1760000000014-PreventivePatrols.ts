import { MigrationInterface, QueryRunner } from 'typeorm';

export class PreventivePatrols1760000000014 implements MigrationInterface {
  name = 'PreventivePatrols1760000000014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE preventive_patrols (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar NOT NULL UNIQUE,
        status varchar NOT NULL DEFAULT 'borrador',
        payload jsonb NOT NULL,
        created_by_user_id uuid NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX preventive_patrols_created_at_idx
        ON preventive_patrols (created_at DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS preventive_patrols`);
  }
}
