import { DocumentType } from '../../domain/document-type.entity';

export function mapDocumentType(t: DocumentType) {
  return {
    id: t.id,
    code: t.code,
    name: t.name,
    description: t.description,
    sortOrder: t.sortOrder,
    status: t.status,
    creationMode: t.creationMode,
    createdAt: t.createdAt,
  };
}
