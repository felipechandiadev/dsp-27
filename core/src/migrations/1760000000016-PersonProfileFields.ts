import { MigrationInterface, QueryRunner } from 'typeorm';

export class PersonProfileFields1760000000016 implements MigrationInterface {
  name = 'PersonProfileFields1760000000016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE persons
        ADD COLUMN IF NOT EXISTS city varchar NULL,
        ADD COLUMN IF NOT EXISTS state varchar NULL,
        ADD COLUMN IF NOT EXISTS marital_status varchar NULL,
        ADD COLUMN IF NOT EXISTS gender varchar NULL,
        ADD COLUMN IF NOT EXISTS nationality varchar NULL,
        ADD COLUMN IF NOT EXISTS profession varchar NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE persons
        DROP COLUMN IF EXISTS profession,
        DROP COLUMN IF EXISTS nationality,
        DROP COLUMN IF EXISTS gender,
        DROP COLUMN IF EXISTS marital_status,
        DROP COLUMN IF EXISTS state,
        DROP COLUMN IF EXISTS city
    `);
  }
}
