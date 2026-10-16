export type UpdateManagedDocumentInput = {
  title?: string;
  documentTypeId?: string | null;
  documentTypeCode?: string | null;
  status?: string;
  bodyJson?: Record<string, unknown>;
  bodyHtml?: string | null;
  bodyAssetId?: string | null;
};

export class UpdateManagedDocumentCommand {
  constructor(
    public readonly actorRole: string,
    public readonly code: string,
    public readonly input: UpdateManagedDocumentInput,
  ) {}
}
