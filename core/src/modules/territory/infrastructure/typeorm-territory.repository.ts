import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationArea } from '../domain/operation-area.entity';
import { OperationAreaType } from '../domain/operation-area-type.entity';
import {
  CreateAreaTypeInput,
  TerritoryRepositoryPort,
} from '../application/ports/territory.repository.port';

@Injectable()
export class TypeOrmTerritoryRepository implements TerritoryRepositoryPort {
  constructor(
    @InjectRepository(OperationAreaType)
    private readonly types: Repository<OperationAreaType>,
    @InjectRepository(OperationArea)
    private readonly areas: Repository<OperationArea>,
  ) {}

  listTypes(status?: string): Promise<OperationAreaType[]> {
    const where = status ? { status } : undefined;
    return this.types.find({
      where,
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  findTypeById(id: string): Promise<OperationAreaType | null> {
    return this.types.findOne({ where: { id } });
  }

  findTypeByCode(code: string): Promise<OperationAreaType | null> {
    return this.types.findOne({ where: { code } });
  }

  createType(data: CreateAreaTypeInput): OperationAreaType {
    return this.types.create({
      code: data.code,
      name: data.name,
      description: data.description ?? null,
      color: data.color ?? null,
      sortOrder: data.sortOrder ?? 0,
      status: data.status ?? 'active',
    });
  }

  saveType(row: OperationAreaType): Promise<OperationAreaType> {
    return this.types.save(row);
  }

  listAreas(filters?: {
    typeId?: string;
    status?: string;
  }): Promise<OperationArea[]> {
    const where: Record<string, string> = {};
    if (filters?.typeId) where.typeId = filters.typeId;
    if (filters?.status) where.status = filters.status;
    return this.areas.find({
      where: Object.keys(where).length ? where : undefined,
      relations: ['type'],
      order: { name: 'ASC' },
    });
  }

  findAreaByCode(code: string): Promise<OperationArea | null> {
    return this.areas.findOne({
      where: { code },
      relations: ['type'],
    });
  }

  findAreaById(id: string): Promise<OperationArea | null> {
    return this.areas.findOne({
      where: { id },
      relations: ['type'],
    });
  }

  saveArea(row: OperationArea): Promise<OperationArea> {
    return this.areas.save(row);
  }
}
