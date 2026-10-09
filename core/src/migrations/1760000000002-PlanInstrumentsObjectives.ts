import { MigrationInterface, QueryRunner } from 'typeorm';

export class PlanInstrumentsObjectives1760000000002
  implements MigrationInterface
{
  name = 'PlanInstrumentsObjectives1760000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE plan_instruments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        year int NOT NULL UNIQUE,
        title varchar NOT NULL,
        version varchar NOT NULL,
        status varchar NOT NULL DEFAULT 'draft',
        mission_text text NOT NULL,
        vision_text text,
        prioritization_notes text,
        results_expected_text text,
        starts_on date,
        ends_on date,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE strategic_objectives (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        plan_instrument_id uuid NOT NULL REFERENCES plan_instruments(id),
        code varchar NOT NULL,
        title varchar NOT NULL,
        rationale text,
        verification text,
        out_of_scope text,
        diagnosis_links text,
        status varchar NOT NULL DEFAULT 'on_track',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_strategic_objectives_plan_code UNIQUE (plan_instrument_id, code)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS strategic_objectives`);
    await queryRunner.query(`DROP TABLE IF EXISTS plan_instruments`);
  }
}
