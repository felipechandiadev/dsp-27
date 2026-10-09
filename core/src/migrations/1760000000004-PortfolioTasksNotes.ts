import { MigrationInterface, QueryRunner } from 'typeorm';

export class PortfolioTasksNotes1760000000004 implements MigrationInterface {
  name = 'PortfolioTasksNotes1760000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE projects (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar NOT NULL UNIQUE,
        kind varchar NOT NULL,
        title varchar NOT NULL,
        status varchar NOT NULL DEFAULT 'pending',
        lead_role varchar,
        summary text,
        problem text,
        scope text,
        legal_milestone text,
        progress_override numeric(5,2),
        starts_on date,
        ends_on date,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE project_strategic_objectives (
        project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        strategic_objective_id uuid NOT NULL REFERENCES strategic_objectives(id) ON DELETE CASCADE,
        PRIMARY KEY (project_id, strategic_objective_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE obligation_projects (
        legal_obligation_id uuid NOT NULL REFERENCES legal_obligations(id) ON DELETE CASCADE,
        project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        PRIMARY KEY (legal_obligation_id, project_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE tasks (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id uuid NOT NULL REFERENCES projects(id),
        code varchar,
        title varchar NOT NULL,
        description text,
        objective_text text,
        status varchar NOT NULL DEFAULT 'pending',
        lead_role varchar,
        starts_on date,
        ends_on date,
        sort_order int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE work_notes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type varchar NOT NULL,
        entity_id uuid NOT NULL,
        body text NOT NULL,
        author_user_id uuid NOT NULL REFERENCES users(id),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_work_notes_entity
      ON work_notes (entity_type, entity_id, created_at)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS work_notes`);
    await queryRunner.query(`DROP TABLE IF EXISTS tasks`);
    await queryRunner.query(`DROP TABLE IF EXISTS obligation_projects`);
    await queryRunner.query(`DROP TABLE IF EXISTS project_strategic_objectives`);
    await queryRunner.query(`DROP TABLE IF EXISTS projects`);
  }
}
