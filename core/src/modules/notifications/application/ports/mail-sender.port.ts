export const MAIL_SENDER = Symbol('MAIL_SENDER');

export type SendMailAsActorResult =
  | { ok: true }
  | { ok: false; reason: 'no_sender' | 'send_failed'; error?: string };

export interface MailSenderPort {
  sendAsActor(input: {
    actorUserId: string;
    to: string;
    subject: string;
    bodyHtml: string;
  }): Promise<SendMailAsActorResult>;
}
