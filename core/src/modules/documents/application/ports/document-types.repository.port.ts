import { DocumentType } from '../../domain/document-type.entity';

export const DOCUMENT_TYPES_REPOSITORY = Symbol('DOCUMENT_TYPES_REPOSITORY');

export interface DocumentTypesRepositoryPort {
  list(status?: string): Promise<DocumentType[]>;
  findById(id: string): Promise<DocumentType | null>;
  findByCode(code: string): Promise<DocumentType | null>;
  create(data: Partial<DocumentType>): DocumentType;
  save(row: DocumentType): Promise<DocumentType>;
}
