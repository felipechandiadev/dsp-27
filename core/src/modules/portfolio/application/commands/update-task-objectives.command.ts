export class UpdateTaskObjectivesCommand {
  constructor(
    public readonly taskId: string,
    public readonly strategicObjectiveIds: string[],
  ) {}
}
