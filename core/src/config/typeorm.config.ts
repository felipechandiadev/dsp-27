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
import { Contractor } from '@modules/contracts/domain/contractor.entity';
import { Contract } from '@modules/contracts/domain/contract.entity';
import { ContractPeriod } from '@modules/contracts/domain/contract-period.entity';
import { ContractPeriodDocument } from '@modules/contracts/domain/contract-period-document.entity';
import { StaffMember } from '@modules/staff/domain/staff-member.entity';
import { StaffRequirementCheck } from '@modules/staff/domain/staff-requirement-check.entity';
import { MultimediaAsset } from '@modules/multimedia/domain/multimedia-asset.entity';
import { RecordCodeSequence } from '@modules/record-codes/domain/record-code-sequence.entity';
import { OperationAreaType } from '@modules/territory/domain/operation-area-type.entity';
import { OperationArea } from '@modules/territory/domain/operation-area.entity';
import { IncidentType } from '@modules/operational-cases/domain/incident-type.entity';
import { OperationType } from '@modules/operational-cases/domain/operation-type.entity';
import { Incidencia } from '@modules/operational-cases/domain/incidencia.entity';
import { Requerimiento } from '@modules/operational-cases/domain/requerimiento.entity';
import { FieldOperation } from '@modules/operational-cases/domain/field-operation.entity';

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
  Contractor,
  Contract,
  ContractPeriod,
  ContractPeriodDocument,
  StaffMember,
  StaffRequirementCheck,
  MultimediaAsset,
  RecordCodeSequence,
  OperationAreaType,
  OperationArea,
  IncidentType,
  OperationType,
  Incidencia,
  Requerimiento,
  FieldOperation,
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
