import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IncidentType } from '../domain/incident-type.entity';
import { OperationType } from '../domain/operation-type.entity';
import { Incidencia } from '../domain/incidencia.entity';
import { Requerimiento } from '../domain/requerimiento.entity';
import { FieldOperation } from '../domain/field-operation.entity';
import { OperationalCasesRepositoryPort } from '../application/ports/operational-cases.repository.port';

const OPEN_REQ = ['ingresado', 'en_gestion'];
const ACTIVE_OP = [
  'asignada',
  'en_traslado',
  'ejecutando',
];

@Injectable()
export class TypeOrmOperationalCasesRepository
  implements OperationalCasesRepositoryPort
{
  constructor(
    @InjectRepository(IncidentType)
    private readonly incidentTypes: Repository<IncidentType>,
    @InjectRepository(OperationType)
    private readonly operationTypes: Repository<OperationType>,
    @InjectRepository(Incidencia)
    private readonly incidencias: Repository<Incidencia>,
    @InjectRepository(Requerimiento)
    private readonly requerimientos: Repository<Requerimiento>,
    @InjectRepository(FieldOperation)
    private readonly operations: Repository<FieldOperation>,
  ) {}

  listIncidentTypes(): Promise<IncidentType[]> {
    return this.incidentTypes.find({
      where: { status: 'active' },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  findIncidentTypeById(id: string): Promise<IncidentType | null> {
    return this.incidentTypes.findOne({ where: { id } });
  }

  findIncidentTypeByCode(code: string): Promise<IncidentType | null> {
    return this.incidentTypes.findOne({ where: { code } });
  }

  createIncidentType(data: Partial<IncidentType>): IncidentType {
    return this.incidentTypes.create(data);
  }

  saveIncidentType(row: IncidentType): Promise<IncidentType> {
    return this.incidentTypes.save(row);
  }

  listOperationTypes(): Promise<OperationType[]> {
    return this.operationTypes.find({
      where: { status: 'active' },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  findOperationTypeById(id: string): Promise<OperationType | null> {
    return this.operationTypes.findOne({ where: { id } });
  }

  listIncidencias(limit = 50): Promise<Incidencia[]> {
    return this.incidencias.find({
      relations: ['incidentType'],
      order: { occurredAt: 'DESC' },
      take: limit,
    });
  }

  findIncidenciaByCode(code: string): Promise<Incidencia | null> {
    return this.incidencias.findOne({
      where: { code },
      relations: ['incidentType'],
    });
  }

  findIncidenciaById(id: string): Promise<Incidencia | null> {
    return this.incidencias.findOne({
      where: { id },
      relations: ['incidentType'],
    });
  }

  createIncidencia(data: Partial<Incidencia>): Incidencia {
    return this.incidencias.create(data);
  }

  saveIncidencia(row: Incidencia): Promise<Incidencia> {
    return this.incidencias.save(row);
  }

  listRequerimientos(filters?: {
    openOnly?: boolean;
    limit?: number;
  }): Promise<Requerimiento[]> {
    const where = filters?.openOnly
      ? { status: In(OPEN_REQ) }
      : undefined;
    return this.requerimientos.find({
      where,
      order: { occurredAt: 'DESC' },
      take: filters?.limit ?? 50,
    });
  }

  findRequerimientoByCode(code: string): Promise<Requerimiento | null> {
    return this.requerimientos.findOne({ where: { code } });
  }

  findRequerimientoById(id: string): Promise<Requerimiento | null> {
    return this.requerimientos.findOne({ where: { id } });
  }

  createRequerimiento(data: Partial<Requerimiento>): Requerimiento {
    return this.requerimientos.create(data);
  }

  saveRequerimiento(row: Requerimiento): Promise<Requerimiento> {
    return this.requerimientos.save(row);
  }

  listOperations(filters?: {
    activeOnly?: boolean;
    limit?: number;
  }): Promise<FieldOperation[]> {
    const where = filters?.activeOnly
      ? { status: In(ACTIVE_OP) }
      : undefined;
    return this.operations.find({
      where,
      relations: ['operationType'],
      order: { createdAt: 'DESC' },
      take: filters?.limit ?? 50,
    });
  }

  findOperationByCode(code: string): Promise<FieldOperation | null> {
    return this.operations.findOne({
      where: { code },
      relations: ['operationType'],
    });
  }

  findOperationById(id: string): Promise<FieldOperation | null> {
    return this.operations.findOne({
      where: { id },
      relations: ['operationType'],
    });
  }

  createOperation(data: Partial<FieldOperation>): FieldOperation {
    return this.operations.create(data);
  }

  saveOperation(row: FieldOperation): Promise<FieldOperation> {
    return this.operations.save(row);
  }
}
