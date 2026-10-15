import { MigrationInterface, QueryRunner } from 'typeorm';

export class CaseLocationGeom1760000000015 implements MigrationInterface {
  name = 'CaseLocationGeom1760000000015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE incidencias
      ADD COLUMN IF NOT EXISTS location_geom geography NULL
    `);
    await queryRunner.query(`
      ALTER TABLE requerimientos
      ADD COLUMN IF NOT EXISTS location_geom geography NULL
    `);
    await queryRunner.query(`
      ALTER TABLE field_operations
      ADD COLUMN IF NOT EXISTS location_geom geography NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS incidencias_location_geom_gix
      ON incidencias USING GIST (location_geom)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS requerimientos_location_geom_gix
      ON requerimientos USING GIST (location_geom)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS field_operations_location_geom_gix
      ON field_operations USING GIST (location_geom)
    `);

    // Backfill Point from existing lat/lng on incidencias / requerimientos
    await queryRunner.query(`
      UPDATE incidencias
      SET location_geom = ST_SetSRID(
        ST_MakePoint(lng, lat),
        4326
      )::geography
      WHERE location_geom IS NULL
        AND lat IS NOT NULL
        AND lng IS NOT NULL
        AND deleted_at IS NULL
    `);
    await queryRunner.query(`
      UPDATE requerimientos
      SET location_geom = ST_SetSRID(
        ST_MakePoint(lng, lat),
        4326
      )::geography
      WHERE location_geom IS NULL
        AND lat IS NOT NULL
        AND lng IS NOT NULL
        AND deleted_at IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS field_operations_location_geom_gix`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS requerimientos_location_geom_gix`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS incidencias_location_geom_gix`,
    );
    await queryRunner.query(
      `ALTER TABLE field_operations DROP COLUMN IF EXISTS location_geom`,
    );
    await queryRunner.query(
      `ALTER TABLE requerimientos DROP COLUMN IF EXISTS location_geom`,
    );
    await queryRunner.query(
      `ALTER TABLE incidencias DROP COLUMN IF EXISTS location_geom`,
    );
  }
}
