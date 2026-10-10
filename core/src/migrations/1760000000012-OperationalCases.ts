import { MigrationInterface, QueryRunner } from 'typeorm';

export class OperationalCases1760000000012 implements MigrationInterface {
  name = 'OperationalCases1760000000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE incident_types (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar NOT NULL UNIQUE,
        name varchar NOT NULL,
        sort_order int NOT NULL DEFAULT 0,
        status varchar NOT NULL DEFAULT 'active',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE operation_types (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar NOT NULL UNIQUE,
        name varchar NOT NULL,
        sort_order int NOT NULL DEFAULT 0,
        status varchar NOT NULL DEFAULT 'active',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE incidencias (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar NOT NULL UNIQUE,
        status varchar NOT NULL DEFAULT 'sin_verificar',
        title varchar NOT NULL,
        descripcion text NULL,
        incident_type_id uuid NULL REFERENCES incident_types(id),
        occurred_at timestamptz NOT NULL DEFAULT now(),
        lat double precision NULL,
        lng double precision NULL,
        location_description text NULL,
        area_id uuid NULL REFERENCES operation_areas(id),
        requerimiento_id uuid NULL,
        ingress_channel varchar NOT NULL DEFAULT 'central',
        registration_origin varchar NOT NULL DEFAULT 'dispatch_entry',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE requerimientos (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar NOT NULL UNIQUE,
        status varchar NOT NULL DEFAULT 'ingresado',
        prioridad varchar NOT NULL DEFAULT 'P2',
        descripcion text NOT NULL,
        occurred_at timestamptz NOT NULL DEFAULT now(),
        lat double precision NULL,
        lng double precision NULL,
        location_description text NULL,
        area_id uuid NULL REFERENCES operation_areas(id),
        incidencia_id uuid NULL REFERENCES incidencias(id),
        persona_solicitante_id uuid NULL REFERENCES persons(id),
        closed_at timestamptz NULL,
        close_reason text NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz NULL
      )
    `);

    await queryRunner.query(`
      ALTER TABLE incidencias
      ADD CONSTRAINT incidencias_requerimiento_id_fkey
      FOREIGN KEY (requerimiento_id) REFERENCES requerimientos(id)
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX incidencias_requerimiento_id_uidx
      ON incidencias (requerimiento_id)
      WHERE requerimiento_id IS NOT NULL AND deleted_at IS NULL
    `);

    await queryRunner.query(`
      CREATE TABLE field_operations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar NOT NULL UNIQUE,
        status varchar NOT NULL DEFAULT 'asignada',
        trigger_type varchar NOT NULL,
        prioridad varchar NOT NULL DEFAULT 'P2',
        briefing text NULL,
        operation_type_id uuid NULL REFERENCES operation_types(id),
        requerimiento_id uuid NULL REFERENCES requerimientos(id),
        incidencia_id uuid NULL REFERENCES incidencias(id),
        assigned_staff_id uuid NULL REFERENCES staff(id),
        area_id uuid NULL REFERENCES operation_areas(id),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX incidencias_status_idx ON incidencias (status)
      WHERE deleted_at IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX requerimientos_status_idx ON requerimientos (status)
      WHERE deleted_at IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX field_operations_status_idx ON field_operations (status)
      WHERE deleted_at IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS field_operations`);
    await queryRunner.query(
      `ALTER TABLE incidencias DROP CONSTRAINT IF EXISTS incidencias_requerimiento_id_fkey`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS requerimientos`);
    await queryRunner.query(`DROP TABLE IF EXISTS incidencias`);
    await queryRunner.query(`DROP TABLE IF EXISTS operation_types`);
    await queryRunner.query(`DROP TABLE IF EXISTS incident_types`);
  }
}
