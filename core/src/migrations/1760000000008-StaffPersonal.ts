import { MigrationInterface, QueryRunner } from 'typeorm';

export class StaffPersonal1760000000008 implements MigrationInterface {
  name = 'StaffPersonal1760000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE staff (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar NOT NULL UNIQUE,
        persona_id uuid NOT NULL UNIQUE REFERENCES persons(id),
        unit varchar NOT NULL,
        ds97_profile varchar,
        inspector_quality_status varchar NOT NULL DEFAULT 'none',
        appointment_at date,
        prior_to_law boolean NOT NULL DEFAULT false,
        employee_number varchar,
        work_email varchar,
        status varchar NOT NULL DEFAULT 'active',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_staff_unit_status ON staff (unit, status)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_staff_inspector_quality ON staff (inspector_quality_status)
    `);

    await queryRunner.query(`
      CREATE TABLE staff_requirement_checks (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
        requirement_code varchar NOT NULL,
        status varchar NOT NULL DEFAULT 'missing',
        notes text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE (staff_id, requirement_code)
      )
    `);

    await queryRunner.query(`
      ALTER TABLE task_assignees
        ADD CONSTRAINT fk_task_assignees_staff
        FOREIGN KEY (staff_id) REFERENCES staff(id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE task_assignees DROP CONSTRAINT IF EXISTS fk_task_assignees_staff
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS staff_requirement_checks`);
    await queryRunner.query(`DROP TABLE IF EXISTS staff`);
  }
}
