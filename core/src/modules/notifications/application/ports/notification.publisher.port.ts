export const NOTIFICATION_PUBLISHER = Symbol('NOTIFICATION_PUBLISHER');

export type PublishNotificationInput = {
  source?: string;
  domain: string;
  kind: string;
  severity?: string;
  title: string;
  body?: string | null;
  payload?: Record<string, unknown>;
  groupKey?: string | null;
  actorUserId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  /** In-app + WS destinatario */
  audienceUserId?: string | null;
  /** También sala de rol (opcional) */
  audienceRole?: string | null;
  email?: {
    toEmail: string | null;
    subject: string;
    bodyHtml: string;
  } | null;
};

export type PublishNotificationResult = {
  notificationId: string | null;
  deliveryId: string | null;
  deduped: boolean;
};

export interface NotificationPublisherPort {
  publish(input: PublishNotificationInput): Promise<PublishNotificationResult>;
}
