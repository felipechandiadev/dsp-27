import { MigrationInterface, QueryRunner } from 'typeorm';

export class LegalNormsObligations1760000000003 implements MigrationInterface {
  name = 'LegalNormsObligations1760000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE legal_norms (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar NOT NULL UNIQUE,
        kind varchar NOT NULL,
        number_label varchar NOT NULL,
        short_title varchar NOT NULL,
        status varchar NOT NULL DEFAULT 'in_force',
        published_on date,
        effective_on date,
        summary text,
        sort_order int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE legal_norm_analyses (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        legal_norm_id uuid NOT NULL REFERENCES legal_norms(id),
        plan_instrument_id uuid REFERENCES plan_instruments(id),
        title varchar NOT NULL,
        body text NOT NULL,
        status varchar NOT NULL DEFAULT 'draft',
        author_user_id uuid REFERENCES users(id),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE legal_obligations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        legal_norm_id uuid NOT NULL REFERENCES legal_norms(id),
        code varchar UNIQUE,
        article_ref varchar,
        description text NOT NULL,
        deadline_on date,
        status varchar NOT NULL DEFAULT 'open',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE obligation_strategic_objectives (
        legal_obligation_id uuid NOT NULL REFERENCES legal_obligations(id) ON DELETE CASCADE,
        strategic_objective_id uuid NOT NULL REFERENCES strategic_objectives(id) ON DELETE CASCADE,
        PRIMARY KEY (legal_obligation_id, strategic_objective_id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS obligation_strategic_objectives`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS legal_obligations`);
    await queryRunner.query(`DROP TABLE IF EXISTS legal_norm_analyses`);
    await queryRunner.query(`DROP TABLE IF EXISTS legal_norms`);
  }
}
