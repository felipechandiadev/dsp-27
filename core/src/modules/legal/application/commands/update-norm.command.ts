export type UpdateNormPayload = {
  kind?: string;
  numberLabel?: string;
  shortTitle?: string;
  status?: string;
  publishedOn?: string | null;
  effectiveOn?: string | null;
  summary?: string | null;
  sortOrder?: number;
};

export class UpdateNormCommand {
  constructor(
    public readonly actorRole: string,
    public readonly code: string,
    public readonly input: UpdateNormPayload,
  ) {}
}
