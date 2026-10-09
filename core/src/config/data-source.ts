import { DataSource } from 'typeorm';
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { entities } from './typeorm.config';
import { InitPostgisPersonsUsers1760000000001 } from '../migrations/1760000000001-InitPostgisPersonsUsers';
import { PlanInstrumentsObjectives1760000000002 } from '../migrations/1760000000002-PlanInstrumentsObjectives';
import { LegalNormsObligations1760000000003 } from '../migrations/1760000000003-LegalNormsObligations';
import { PortfolioTasksNotes1760000000004 } from '../migrations/1760000000004-PortfolioTasksNotes';

const root = path.resolve(__dirname, '../..');
dotenv.config({ path: path.join(root, '.env') });
dotenv.config({ path: path.join(root, '.env.local') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'dsp',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'dsp27',
  synchronize: false,
  entities,
  migrations: [
    InitPostgisPersonsUsers1760000000001,
    PlanInstrumentsObjectives1760000000002,
    LegalNormsObligations1760000000003,
    PortfolioTasksNotes1760000000004,
  ],
  migrationsTableName: 'typeorm_migrations',
  logging: process.env.DB_LOGGING === 'true',
});
