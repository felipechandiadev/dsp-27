export class UpdateDocumentTypeCommand {
  constructor(
    public readonly actorRole: string,
    public readonly code: string,
    public readonly input: {
      name?: string;
      description?: string | null;
      sortOrder?: number;
      status?: string;
    },
  ) {}
}
