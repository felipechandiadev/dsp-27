export type CreateSubtaskInput = {
  title: string;
  description?: string | null;
  objectiveText?: string | null;
  status?: string;
  startsOn?: string | null;
  endsOn?: string | null;
  sortOrder?: number;
  strategicObjectiveIds?: string[];
};

export class CreateSubtaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly input: CreateSubtaskInput,
  ) {}
}
