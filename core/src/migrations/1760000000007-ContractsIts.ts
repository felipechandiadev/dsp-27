import { MigrationInterface, QueryRunner } from 'typeorm';

export class ContractsIts1760000000007 implements MigrationInterface {
  name = 'ContractsIts1760000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE contractors (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        rut varchar NOT NULL UNIQUE,
        name varchar NOT NULL,
        email varchar,
        phone varchar,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE contracts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar NOT NULL UNIQUE,
        kind varchar NOT NULL,
        title varchar NOT NULL,
        status varchar NOT NULL DEFAULT 'draft',
        contractor_id uuid NOT NULL REFERENCES contractors(id),
        its_user_id uuid NOT NULL REFERENCES users(id),
        project_id uuid,
        starts_on date NOT NULL,
        ends_on date,
        notes text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_contracts_kind_status ON contracts (kind, status)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_contracts_its_user ON contracts (its_user_id)
    `);

    await queryRunner.query(`
      CREATE TABLE contract_periods (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
        year int NOT NULL,
        month int NOT NULL,
        status varchar NOT NULL DEFAULT 'open',
        docs_due_on date NOT NULL,
        certified_at timestamptz,
        certification_notes text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE (contract_id, year, month)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE contract_period_documents (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        period_id uuid NOT NULL REFERENCES contract_periods(id) ON DELETE CASCADE,
        doc_type varchar NOT NULL,
        status varchar NOT NULL DEFAULT 'missing',
        notes text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE (period_id, doc_type)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS contract_period_documents`);
    await queryRunner.query(`DROP TABLE IF EXISTS contract_periods`);
    await queryRunner.query(`DROP TABLE IF EXISTS contracts`);
    await queryRunner.query(`DROP TABLE IF EXISTS contractors`);
  }
}
