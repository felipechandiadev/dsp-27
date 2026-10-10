import { MigrationInterface, QueryRunner } from 'typeorm';

export class OperationAreas1760000000011 implements MigrationInterface {
  name = 'OperationAreas1760000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);

    await queryRunner.query(`
      CREATE TABLE operation_area_types (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar NOT NULL UNIQUE,
        name varchar NOT NULL,
        description text NULL,
        color varchar NULL,
        sort_order int NOT NULL DEFAULT 0,
        status varchar NOT NULL DEFAULT 'active',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE operation_areas (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar NOT NULL UNIQUE,
        name varchar NOT NULL,
        type_id uuid NOT NULL REFERENCES operation_area_types(id),
        parent_id uuid NULL REFERENCES operation_areas(id),
        geom geography(Polygon, 4326) NOT NULL,
        status varchar NOT NULL DEFAULT 'active',
        notes text NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX operation_areas_geom_gix ON operation_areas USING GIST (geom)
    `);
    await queryRunner.query(`
      CREATE INDEX operation_areas_type_id_idx ON operation_areas (type_id)
    `);
    await queryRunner.query(`
      CREATE INDEX operation_areas_parent_id_idx ON operation_areas (parent_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS operation_areas`);
    await queryRunner.query(`DROP TABLE IF EXISTS operation_area_types`);
  }
}
