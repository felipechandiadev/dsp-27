import { MigrationInterface, QueryRunner } from 'typeorm';

export class Notifications1760000000006 implements MigrationInterface {
  name = 'Notifications1760000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE notifications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        source varchar NOT NULL DEFAULT 'automation',
        domain varchar NOT NULL,
        kind varchar NOT NULL,
        severity varchar NOT NULL DEFAULT 'info',
        title varchar NOT NULL,
        body text,
        payload jsonb NOT NULL DEFAULT '{}'::jsonb,
        group_key varchar,
        actor_user_id uuid REFERENCES users(id),
        project_id uuid,
        task_id uuid,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_notifications_group_key_created
        ON notifications (group_key, created_at DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_notifications_kind_created
        ON notifications (kind, created_at DESC)
    `);

    await queryRunner.query(`
      CREATE TABLE notification_deliveries (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        notification_id uuid NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES users(id),
        status varchar NOT NULL DEFAULT 'unread',
        read_at timestamptz,
        dismissed_at timestamptz,
        delivered_at timestamptz NOT NULL DEFAULT now(),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_notification_deliveries_inbox
        ON notification_deliveries (user_id, status, delivered_at DESC)
    `);

    await queryRunner.query(`
      CREATE TABLE notification_outbox (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        notification_id uuid NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
        channel varchar NOT NULL DEFAULT 'email',
        status varchar NOT NULL DEFAULT 'pending',
        to_email varchar,
        subject text NOT NULL,
        body_html text NOT NULL,
        actor_user_id uuid REFERENCES users(id),
        attempts int NOT NULL DEFAULT 0,
        max_attempts int NOT NULL DEFAULT 5,
        next_attempt_at timestamptz NOT NULL DEFAULT now(),
        last_error text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_notification_outbox_poll
        ON notification_outbox (status, next_attempt_at)
    `);

    await queryRunner.query(`
      CREATE TABLE task_assignees (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id uuid REFERENCES tasks(id),
        subtask_id uuid,
        person_id uuid REFERENCES persons(id),
        staff_id uuid,
        assignment_role varchar NOT NULL DEFAULT 'executor',
        assigned_at timestamptz NOT NULL DEFAULT now(),
        unassigned_at timestamptz,
        assigned_by_user_id uuid REFERENCES users(id),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_task_assignees_task_xor
          CHECK (
            (task_id IS NOT NULL AND subtask_id IS NULL)
            OR (task_id IS NULL AND subtask_id IS NOT NULL)
          ),
        CONSTRAINT chk_task_assignees_person_xor
          CHECK (
            (person_id IS NOT NULL AND staff_id IS NULL)
            OR (person_id IS NULL AND staff_id IS NOT NULL)
          )
      )
    `);
    await queryRunner.query(`
      CREATE INDEX idx_task_assignees_task ON task_assignees (task_id)
      WHERE unassigned_at IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS task_assignees`);
    await queryRunner.query(`DROP TABLE IF EXISTS notification_outbox`);
    await queryRunner.query(`DROP TABLE IF EXISTS notification_deliveries`);
    await queryRunner.query(`DROP TABLE IF EXISTS notifications`);
  }
}
