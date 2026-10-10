export type UpdateAreaTypePayload = {
  name?: string;
  description?: string | null;
  color?: string | null;
  sortOrder?: number;
  status?: string;
};

export class UpdateAreaTypeCommand {
  constructor(
    public readonly actorRole: string,
    public readonly id: string,
    public readonly input: UpdateAreaTypePayload,
  ) {}
}
