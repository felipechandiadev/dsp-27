import { ManagedDocument } from '../../domain/managed-document.entity';

export const MANAGED_DOCUMENTS_REPOSITORY = Symbol(
  'MANAGED_DOCUMENTS_REPOSITORY',
);

export interface ManagedDocumentsRepositoryPort {
  list(filters?: { status?: string }): Promise<ManagedDocument[]>;
  findByCode(code: string): Promise<ManagedDocument | null>;
  findDocumentTypeIdByCode(code: string): Promise<string | null>;
  create(data: Partial<ManagedDocument>): ManagedDocument;
  save(row: ManagedDocument): Promise<ManagedDocument>;
}
