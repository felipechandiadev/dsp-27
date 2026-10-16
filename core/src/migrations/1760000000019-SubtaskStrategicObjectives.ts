import { MigrationInterface, QueryRunner } from 'typeorm';

export class SubtaskStrategicObjectives1760000000019
  implements MigrationInterface
{
  name = 'SubtaskStrategicObjectives1760000000019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS subtasks (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id uuid NOT NULL REFERENCES tasks(id),
        title varchar NOT NULL,
        description text,
        objective_text text,
        status varchar NOT NULL DEFAULT 'pending',
        location geography(Point, 4326),
        location_accuracy_m numeric,
        located_at timestamptz,
        starts_on date,
        ends_on date,
        sort_order int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_subtasks_task
      ON subtasks (task_id)
      WHERE deleted_at IS NULL
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS task_strategic_objectives (
        task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        strategic_objective_id uuid NOT NULL REFERENCES strategic_objectives(id) ON DELETE CASCADE,
        PRIMARY KEY (task_id, strategic_objective_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS subtask_strategic_objectives (
        subtask_id uuid NOT NULL REFERENCES subtasks(id) ON DELETE CASCADE,
        strategic_objective_id uuid NOT NULL REFERENCES strategic_objectives(id) ON DELETE CASCADE,
        PRIMARY KEY (subtask_id, strategic_objective_id)
      )
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE task_assignees
          ADD CONSTRAINT fk_task_assignees_subtask
          FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE task_assignees
      DROP CONSTRAINT IF EXISTS fk_task_assignees_subtask
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS subtask_strategic_objectives`);
    await queryRunner.query(`DROP TABLE IF EXISTS task_strategic_objectives`);
    await queryRunner.query(`DROP TABLE IF EXISTS subtasks`);
  }
}
