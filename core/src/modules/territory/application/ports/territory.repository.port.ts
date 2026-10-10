import { OperationArea } from '@modules/territory/domain/operation-area.entity';
import { OperationAreaType } from '@modules/territory/domain/operation-area-type.entity';

export const TERRITORY_REPOSITORY = Symbol('TERRITORY_REPOSITORY');

export type CreateAreaTypeInput = {
  code: string;
  name: string;
  description?: string | null;
  color?: string | null;
  sortOrder?: number;
  status?: string;
};

export type CreateAreaMetaInput = {
  code: string;
  name: string;
  typeId: string;
  parentId?: string | null;
  status?: string;
  notes?: string | null;
};

export interface TerritoryRepositoryPort {
  listTypes(status?: string): Promise<OperationAreaType[]>;
  findTypeById(id: string): Promise<OperationAreaType | null>;
  findTypeByCode(code: string): Promise<OperationAreaType | null>;
  createType(data: CreateAreaTypeInput): OperationAreaType;
  saveType(row: OperationAreaType): Promise<OperationAreaType>;

  listAreas(filters?: {
    typeId?: string;
    status?: string;
  }): Promise<OperationArea[]>;
  findAreaByCode(code: string): Promise<OperationArea | null>;
  findAreaById(id: string): Promise<OperationArea | null>;
  saveArea(row: OperationArea): Promise<OperationArea>;
}
