import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfigService } from './config.service';
import { Person } from '@modules/persons/domain/person.entity';
import { User } from '@modules/users/domain/user.entity';
import { PlanInstrument } from '@modules/plan/domain/plan-instrument.entity';
import { StrategicObjective } from '@modules/plan/domain/strategic-objective.entity';
import { LegalNorm } from '@modules/legal/domain/legal-norm.entity';
import { LegalNormAnalysis } from '@modules/legal/domain/legal-norm-analysis.entity';
import { LegalObligation } from '@modules/legal/domain/legal-obligation.entity';
import { Project } from '@modules/portfolio/domain/project.entity';
import { Task } from '@modules/portfolio/domain/task.entity';
import { WorkNote } from '@modules/portfolio/domain/work-note.entity';
import { UserOauthAccount } from '@modules/integrations/microsoft/domain/user-oauth-account.entity';
import { Notification } from '@modules/notifications/domain/notification.entity';
import { NotificationDelivery } from '@modules/notifications/domain/notification-delivery.entity';
import { NotificationOutbox } from '@modules/notifications/domain/notification-outbox.entity';
import { TaskAssignee } from '@modules/portfolio/domain/task-assignee.entity';

export const entities = [
  Person,
  User,
  PlanInstrument,
  StrategicObjective,
  LegalNorm,
  LegalNormAnalysis,
  LegalObligation,
  Project,
  Task,
  WorkNote,
  UserOauthAccount,
  Notification,
  NotificationDelivery,
  NotificationOutbox,
  TaskAssignee,
];

export function buildTypeOrmOptions(
  config: AppConfigService,
): TypeOrmModuleOptions {
  const db = config.database;
  return {
    type: 'postgres',
    host: db.host,
    port: db.port,
    username: db.username,
    password: db.password,
    database: db.database,
    synchronize: false,
    logging: db.logging,
    entities,
    migrationsTableName: 'typeorm_migrations',
    ssl: db.ssl ? { rejectUnauthorized: false } : false,
    extra: {
      max: db.maxConnections,
      connectionTimeoutMillis: db.connectionTimeout,
    },
  };
}
