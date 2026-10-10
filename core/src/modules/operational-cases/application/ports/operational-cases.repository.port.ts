import { IncidentType } from '../../domain/incident-type.entity';
import { OperationType } from '../../domain/operation-type.entity';
import { Incidencia } from '../../domain/incidencia.entity';
import { Requerimiento } from '../../domain/requerimiento.entity';
import { FieldOperation } from '../../domain/field-operation.entity';

export const OPERATIONAL_CASES_REPOSITORY = Symbol(
  'OPERATIONAL_CASES_REPOSITORY',
);

export interface OperationalCasesRepositoryPort {
  listIncidentTypes(): Promise<IncidentType[]>;
  findIncidentTypeById(id: string): Promise<IncidentType | null>;
  findIncidentTypeByCode(code: string): Promise<IncidentType | null>;
  createIncidentType(data: Partial<IncidentType>): IncidentType;
  saveIncidentType(row: IncidentType): Promise<IncidentType>;
  listOperationTypes(): Promise<OperationType[]>;
  findOperationTypeById(id: string): Promise<OperationType | null>;

  listIncidencias(limit?: number): Promise<Incidencia[]>;
  findIncidenciaByCode(code: string): Promise<Incidencia | null>;
  findIncidenciaById(id: string): Promise<Incidencia | null>;
  createIncidencia(data: Partial<Incidencia>): Incidencia;
  saveIncidencia(row: Incidencia): Promise<Incidencia>;

  listRequerimientos(filters?: {
    openOnly?: boolean;
    limit?: number;
  }): Promise<Requerimiento[]>;
  findRequerimientoByCode(code: string): Promise<Requerimiento | null>;
  findRequerimientoById(id: string): Promise<Requerimiento | null>;
  createRequerimiento(data: Partial<Requerimiento>): Requerimiento;
  saveRequerimiento(row: Requerimiento): Promise<Requerimiento>;

  listOperations(filters?: {
    activeOnly?: boolean;
    limit?: number;
  }): Promise<FieldOperation[]>;
  findOperationByCode(code: string): Promise<FieldOperation | null>;
  findOperationById(id: string): Promise<FieldOperation | null>;
  createOperation(data: Partial<FieldOperation>): FieldOperation;
  saveOperation(row: FieldOperation): Promise<FieldOperation>;
}
