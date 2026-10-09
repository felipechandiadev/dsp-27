export class ResetUserPasswordCommand {
  constructor(
    public readonly userId: string,
    public readonly newPassword: string,
  ) {}
}
