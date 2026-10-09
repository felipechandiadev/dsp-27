import { Notification } from '../../domain/notification.entity';
import { NotificationDelivery } from '../../domain/notification-delivery.entity';
import { NotificationOutbox } from '../../domain/notification-outbox.entity';

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

export type CreateNotificationInput = {
  source: string;
  domain: string;
  kind: string;
  severity: string;
  title: string;
  body: string | null;
  payload: Record<string, unknown>;
  groupKey: string | null;
  actorUserId: string | null;
  projectId: string | null;
  taskId: string | null;
};

export type InboxItem = {
  delivery: NotificationDelivery;
  notification: Notification;
};

export interface NotificationRepositoryPort {
  findRecentByGroupKey(
    groupKey: string,
    since: Date,
  ): Promise<Notification | null>;
  createNotification(input: CreateNotificationInput): Promise<Notification>;
  createDelivery(
    notificationId: string,
    userId: string,
  ): Promise<NotificationDelivery>;
  createOutbox(input: {
    notificationId: string;
    toEmail: string | null;
    subject: string;
    bodyHtml: string;
    actorUserId: string | null;
    status: string;
  }): Promise<NotificationOutbox>;
  listInbox(userId: string, limit: number): Promise<InboxItem[]>;
  countUnread(userId: string): Promise<number>;
  markRead(deliveryId: string, userId: string): Promise<NotificationDelivery | null>;
  markAllRead(userId: string): Promise<number>;
  claimOutboxBatch(limit: number): Promise<NotificationOutbox[]>;
  saveOutbox(row: NotificationOutbox): Promise<NotificationOutbox>;
}
