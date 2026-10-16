export class CreateDocumentTypeCommand {
  constructor(
    public readonly actorRole: string,
    public readonly input: {
      name: string;
      description?: string;
      sortOrder?: number;
      creationMode?: string;
    },
  ) {}
}
