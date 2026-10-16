export class UploadManagedDocumentBodyCommand {
  constructor(
    public readonly actorUserId: string,
    public readonly actorRole: string,
    public readonly code: string,
    public readonly file: {
      buffer: Buffer;
      mimeType: string;
      originalName: string;
    },
  ) {}
}
