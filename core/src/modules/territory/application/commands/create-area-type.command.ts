export type CreateAreaTypePayload = {
  code: string;
  name: string;
  description?: string | null;
  color?: string | null;
  sortOrder?: number;
  status?: string;
};

export class CreateAreaTypeCommand {
  constructor(
    public readonly actorRole: string,
    public readonly input: CreateAreaTypePayload,
  ) {}
}
