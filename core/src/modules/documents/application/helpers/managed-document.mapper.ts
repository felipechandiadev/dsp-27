import { ManagedDocument } from '../../domain/managed-document.entity';

export function mapManagedDocument(row: ManagedDocument) {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    documentTypeId: row.documentTypeId,
    documentType: row.documentType
      ? {
          id: row.documentType.id,
          code: row.documentType.code,
          name: row.documentType.name,
        }
      : null,
    status: row.status,
    bodyJson: row.bodyJson ?? {},
    bodyHtml: row.bodyHtml,
    bodyAssetId: row.bodyAssetId,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapManagedDocumentListItem(row: ManagedDocument) {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    documentTypeId: row.documentTypeId,
    documentType: row.documentType
      ? {
          id: row.documentType.id,
          code: row.documentType.code,
          name: row.documentType.name,
        }
      : null,
    status: row.status,
    updatedAt: row.updatedAt,
    createdAt: row.createdAt,
  };
}
