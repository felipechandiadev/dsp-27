export type CreateIncidentTypeInput = {
  name: string;
  sortOrder?: number;
};

export class CreateIncidentTypeCommand {
  constructor(
    public readonly actorRole: string,
    public readonly input: CreateIncidentTypeInput,
  ) {}
}
