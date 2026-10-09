export class HandleMicrosoftCallbackCommand {
  constructor(
    public readonly code: string | undefined,
    public readonly state: string | undefined,
    public readonly error: string | undefined,
  ) {}
}
