export type ManagedDocumentListItem = {
  id: string;
  code: string;
  title: string;
  documentTypeId: string | null;
  documentType: {
    id: string;
    code: string;
    name: string;
  } | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ManagedDocumentDetail = ManagedDocumentListItem & {
  bodyJson: Record<string, unknown>;
  bodyHtml: string | null;
  bodyAssetId: string | null;
  createdByUserId: string | null;
};

export function reportStatusLabel(status: string): string {
  if (status === 'published') return 'Publicado';
  if (status === 'draft') return 'Borrador';
  return status;
}
