import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordCodesModule } from '@modules/record-codes/record-codes.module';
import { IncidentType } from './domain/incident-type.entity';
import { OperationType } from './domain/operation-type.entity';
import { Incidencia } from './domain/incidencia.entity';
import { Requerimiento } from './domain/requerimiento.entity';
import { FieldOperation } from './domain/field-operation.entity';
import { OPERATIONAL_CASES_REPOSITORY } from './application/ports/operational-cases.repository.port';
import { TypeOrmOperationalCasesRepository } from './infrastructure/typeorm-operational-cases.repository';
import { OperationalCasesController } from './presentation/operational-cases.controller';
import { ListIncidentTypesHandler } from './application/handlers/list-incident-types.handler';
import { ListOperationTypesHandler } from './application/handlers/list-operation-types.handler';
import { ListIncidenciasHandler } from './application/handlers/list-incidencias.handler';
import { GetIncidenciaHandler } from './application/handlers/get-incidencia.handler';
import { ListRequerimientosHandler } from './application/handlers/list-requerimientos.handler';
import { GetRequerimientoHandler } from './application/handlers/get-requerimiento.handler';
import { ListOperationsHandler } from './application/handlers/list-operations.handler';
import { GetOperationHandler } from './application/handlers/get-operation.handler';
import { CreateIncidentTypeHandler } from './application/handlers/create-incident-type.handler';
import { CreateIncidenciaHandler } from './application/handlers/create-incidencia.handler';
import { PatchIncidenciaVerificationHandler } from './application/handlers/patch-incidencia-verification.handler';
import { PatchIncidenciaHandler } from './application/handlers/patch-incidencia.handler';
import { CreateRequerimientoHandler } from './application/handlers/create-requerimiento.handler';
import { PatchRequerimientoStatusHandler } from './application/handlers/patch-requerimiento-status.handler';
import { PatchRequerimientoHandler } from './application/handlers/patch-requerimiento.handler';
import { CloseRequerimientoHandler } from './application/handlers/close-requerimiento.handler';
import { DeployOperationHandler } from './application/handlers/deploy-operation.handler';
import { PatchOperationStatusHandler } from './application/handlers/patch-operation-status.handler';
import { PatchOperationHandler } from './application/handlers/patch-operation.handler';

@Module({
  imports: [
    CqrsModule,
    RecordCodesModule,
    TypeOrmModule.forFeature([
      IncidentType,
      OperationType,
      Incidencia,
      Requerimiento,
      FieldOperation,
    ]),
  ],
  controllers: [OperationalCasesController],
  providers: [
    {
      provide: OPERATIONAL_CASES_REPOSITORY,
      useClass: TypeOrmOperationalCasesRepository,
    },
    ListIncidentTypesHandler,
    ListOperationTypesHandler,
    ListIncidenciasHandler,
    GetIncidenciaHandler,
    ListRequerimientosHandler,
    GetRequerimientoHandler,
    ListOperationsHandler,
    GetOperationHandler,
    CreateIncidentTypeHandler,
    CreateIncidenciaHandler,
    PatchIncidenciaVerificationHandler,
    PatchIncidenciaHandler,
    CreateRequerimientoHandler,
    PatchRequerimientoStatusHandler,
    PatchRequerimientoHandler,
    CloseRequerimientoHandler,
    DeployOperationHandler,
    PatchOperationStatusHandler,
    PatchOperationHandler,
  ],
  exports: [TypeOrmModule, OPERATIONAL_CASES_REPOSITORY],
})
export class OperationalCasesModule {}
