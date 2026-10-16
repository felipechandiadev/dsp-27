export class UpdateSubtaskObjectivesCommand {
  constructor(
    public readonly subtaskId: string,
    public readonly strategicObjectiveIds: string[],
  ) {}
}
