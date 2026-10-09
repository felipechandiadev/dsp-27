export class AssignTaskCommand {
  constructor(
    public readonly actorUserId: string,
    public readonly taskId: string,
    public readonly personId: string,
    public readonly assignmentRole: string,
  ) {}
}
