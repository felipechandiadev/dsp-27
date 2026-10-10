export class PatchOperationCommand {
  constructor(
    public readonly actorRole: string,
    public readonly code: string,
    public readonly input: {
      briefing?: string | null;
      prioridad?: string;
    },
  ) {}
}
