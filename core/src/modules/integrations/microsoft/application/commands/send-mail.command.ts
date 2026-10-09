export class SendMailCommand {
  constructor(
    public readonly userId: string,
    public readonly to: string,
    public readonly subject: string,
    public readonly bodyHtml: string,
  ) {}
}
