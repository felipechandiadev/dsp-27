export type CreateNormPayload = {
  code?: string;
  kind: string;
  numberLabel: string;
  shortTitle: string;
  status?: string;
  publishedOn?: string | null;
  effectiveOn?: string | null;
  summary?: string | null;
  sortOrder?: number;
};

export class CreateNormCommand {
  constructor(
    public readonly actorRole: string,
    public readonly input: CreateNormPayload,
  ) {}
}
