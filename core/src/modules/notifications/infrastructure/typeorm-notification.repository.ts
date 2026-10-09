import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import { Notification } from '../domain/notification.entity';
import { NotificationDelivery } from '../domain/notification-delivery.entity';
import { NotificationOutbox } from '../domain/notification-outbox.entity';
import {
  CreateNotificationInput,
  InboxItem,
  NotificationRepositoryPort,
} from '../application/ports/notification.repository.port';

@Injectable()
export class TypeOrmNotificationRepository
  implements NotificationRepositoryPort
{
  constructor(
    @InjectRepository(Notification)
    private readonly notifications: Repository<Notification>,
    @InjectRepository(NotificationDelivery)
    private readonly deliveries: Repository<NotificationDelivery>,
    @InjectRepository(NotificationOutbox)
    private readonly outbox: Repository<NotificationOutbox>,
  ) {}

  findRecentByGroupKey(
    groupKey: string,
    since: Date,
  ): Promise<Notification | null> {
    return this.notifications
      .createQueryBuilder('n')
      .where('n.group_key = :groupKey', { groupKey })
      .andWhere('n.created_at >= :since', { since })
      .orderBy('n.created_at', 'DESC')
      .getOne();
  }

  createNotification(input: CreateNotificationInput): Promise<Notification> {
    const row = this.notifications.create({
      source: input.source,
      domain: input.domain,
      kind: input.kind,
      severity: input.severity,
      title: input.title,
      body: input.body,
      payload: input.payload,
      groupKey: input.groupKey,
      actorUserId: input.actorUserId,
      projectId: input.projectId,
      taskId: input.taskId,
    });
    return this.notifications.save(row);
  }

  createDelivery(
    notificationId: string,
    userId: string,
  ): Promise<NotificationDelivery> {
    const row = this.deliveries.create({
      notificationId,
      userId,
      status: 'unread',
      deliveredAt: new Date(),
      readAt: null,
      dismissedAt: null,
    });
    return this.deliveries.save(row);
  }

  createOutbox(input: {
    notificationId: string;
    toEmail: string | null;
    subject: string;
    bodyHtml: string;
    actorUserId: string | null;
    status: string;
  }): Promise<NotificationOutbox> {
    const row = this.outbox.create({
      notificationId: input.notificationId,
      channel: 'email',
      status: input.status,
      toEmail: input.toEmail,
      subject: input.subject,
      bodyHtml: input.bodyHtml,
      actorUserId: input.actorUserId,
      attempts: 0,
      maxAttempts: 5,
      nextAttemptAt: new Date(),
      lastError: null,
    });
    return this.outbox.save(row);
  }

  async listInbox(userId: string, limit: number): Promise<InboxItem[]> {
    const deliveries = await this.deliveries.find({
      where: { userId },
      order: { deliveredAt: 'DESC' },
      take: limit,
    });
    if (deliveries.length === 0) return [];
    const ids = [...new Set(deliveries.map((d) => d.notificationId))];
    const notes = await this.notifications.find({ where: { id: In(ids) } });
    const byId = new Map(notes.map((n) => [n.id, n]));
    return deliveries
      .map((delivery) => {
        const notification = byId.get(delivery.notificationId);
        if (!notification) return null;
        return { delivery, notification };
      })
      .filter((x): x is InboxItem => x !== null);
  }

  countUnread(userId: string): Promise<number> {
    return this.deliveries.count({ where: { userId, status: 'unread' } });
  }

  async markRead(
    deliveryId: string,
    userId: string,
  ): Promise<NotificationDelivery | null> {
    const row = await this.deliveries.findOne({
      where: { id: deliveryId, userId },
    });
    if (!row) return null;
    row.status = 'read';
    row.readAt = new Date();
    return this.deliveries.save(row);
  }

  async markAllRead(userId: string): Promise<number> {
    const result = await this.deliveries.update(
      { userId, status: 'unread' },
      { status: 'read', readAt: new Date() },
    );
    return result.affected ?? 0;
  }

  async claimOutboxBatch(limit: number): Promise<NotificationOutbox[]> {
    const rows = await this.outbox.find({
      where: {
        status: 'pending',
        nextAttemptAt: LessThanOrEqual(new Date()),
      },
      order: { nextAttemptAt: 'ASC' },
      take: limit,
    });
    const claimed: NotificationOutbox[] = [];
    for (const row of rows) {
      row.status = 'processing';
      claimed.push(await this.outbox.save(row));
    }
    return claimed;
  }

  saveOutbox(row: NotificationOutbox): Promise<NotificationOutbox> {
    return this.outbox.save(row);
  }
}
