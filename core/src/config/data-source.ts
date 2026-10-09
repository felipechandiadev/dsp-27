import { DataSource } from 'typeorm';
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { entities } from './typeorm.config';
import { InitPostgisPersonsUsers1760000000001 } from '../migrations/1760000000001-InitPostgisPersonsUsers';
import { PlanInstrumentsObjectives1760000000002 } from '../migrations/1760000000002-PlanInstrumentsObjectives';
import { LegalNormsObligations1760000000003 } from '../migrations/1760000000003-LegalNormsObligations';
import { PortfolioTasksNotes1760000000004 } from '../migrations/1760000000004-PortfolioTasksNotes';
import { UserOauthAccounts1760000000005 } from '../migrations/1760000000005-UserOauthAccounts';
import { Notifications1760000000006 } from '../migrations/1760000000006-Notifications';
import { ContractsIts1760000000007 } from '../migrations/1760000000007-ContractsIts';
import { StaffPersonal1760000000008 } from '../migrations/1760000000008-StaffPersonal';
import { MultimediaAssets1760000000009 } from '../migrations/1760000000009-MultimediaAssets';
import { RecordCodeSequences1760000000010 } from '../migrations/1760000000010-RecordCodeSequences';


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
    UserOauthAccounts1760000000005,
    Notifications1760000000006,
    ContractsIts1760000000007,
    StaffPersonal1760000000008,
    MultimediaAssets1760000000009,
    RecordCodeSequences1760000000010,
  ],
  migrationsTableName: 'typeorm_migrations',
  logging: process.env.DB_LOGGING === 'true',
});
