export type UpdateSubtaskInput = {
  title?: string;
  description?: string | null;
  objectiveText?: string | null;
  status?: string;
  startsOn?: string | null;
  endsOn?: string | null;
  sortOrder?: number;
  strategicObjectiveIds?: string[];
};

export class UpdateSubtaskCommand {
  constructor(
    public readonly subtaskId: string,
    public readonly input: UpdateSubtaskInput,
  ) {}
}
