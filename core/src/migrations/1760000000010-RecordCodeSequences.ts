import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecordCodeSequences1760000000010 implements MigrationInterface {
  name = 'RecordCodeSequences1760000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE record_code_sequences (
        prefix varchar(3) NOT NULL,
        year smallint NOT NULL,
        last_value int NOT NULL DEFAULT 0,
        PRIMARY KEY (prefix, year)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS record_code_sequences`);
  }
}
