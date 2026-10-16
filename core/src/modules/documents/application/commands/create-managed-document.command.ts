export type CreateManagedDocumentInput = {
  title: string;
  documentTypeId?: string | null;
  documentTypeCode?: string | null;
  status?: string;
  bodyJson?: Record<string, unknown>;
  bodyHtml?: string | null;
  bodyAssetId?: string | null;
};

export class CreateManagedDocumentCommand {
  constructor(
    public readonly actorUserId: string,
    public readonly actorRole: string,
    public readonly input: CreateManagedDocumentInput,
  ) {}
}
