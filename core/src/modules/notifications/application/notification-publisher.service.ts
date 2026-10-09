import { Inject, Injectable } from '@nestjs/common';
import { AppConfigService } from '@config/config.service';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepositoryPort,
} from './ports/notification.repository.port';
import {
  REALTIME_PUBLISHER,
  RealtimePublisherPort,
} from './ports/realtime.publisher.port';
import {
  NotificationPublisherPort,
  PublishNotificationInput,
  PublishNotificationResult,
} from './ports/notification.publisher.port';

@Injectable()
export class NotificationPublisherService
  implements NotificationPublisherPort
{
  constructor(
    private readonly config: AppConfigService,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repo: NotificationRepositoryPort,
    @Inject(REALTIME_PUBLISHER)
    private readonly realtime: RealtimePublisherPort,
  ) {}

  async publish(
    input: PublishNotificationInput,
  ): Promise<PublishNotificationResult> {
    if (input.groupKey) {
      const since = new Date(
        Date.now() -
          this.config.notifications.dedupWindowMinutes * 60 * 1000,
      );
      const existing = await this.repo.findRecentByGroupKey(
        input.groupKey,
        since,
      );
      if (existing) {
        return {
          notificationId: existing.id,
          deliveryId: null,
          deduped: true,
        };
      }
    }

    const notification = await this.repo.createNotification({
      source: input.source ?? 'automation',
      domain: input.domain,
      kind: input.kind,
      severity: input.severity ?? 'info',
      title: input.title,
      body: input.body ?? null,
      payload: input.payload ?? {},
      groupKey: input.groupKey ?? null,
      actorUserId: input.actorUserId ?? null,
      projectId: input.projectId ?? null,
      taskId: input.taskId ?? null,
    });

    let deliveryId: string | null = null;
    if (input.audienceUserId) {
      const delivery = await this.repo.createDelivery(
        notification.id,
        input.audienceUserId,
      );
      deliveryId = delivery.id;
      const payload = {
        deliveryId: delivery.id,
        notificationId: notification.id,
        kind: notification.kind,
        severity: notification.severity,
        title: notification.title,
        body: notification.body,
        payload: notification.payload,
        projectId: notification.projectId,
        taskId: notification.taskId,
        deliveredAt: delivery.deliveredAt.toISOString(),
      };
      this.realtime.emitToUser(input.audienceUserId, payload);
      if (input.audienceRole) {
        this.realtime.emitToRole(input.audienceRole, payload);
      }
    }

    if (input.email) {
      let status = 'pending';
      if (!input.email.toEmail) {
        status = 'skipped_no_recipient';
      } else if (!input.actorUserId) {
        status = 'skipped_no_sender';
      }
      await this.repo.createOutbox({
        notificationId: notification.id,
        toEmail: input.email.toEmail,
        subject: input.email.subject,
        bodyHtml: input.email.bodyHtml,
        actorUserId: input.actorUserId ?? null,
        status,
      });
    }

    return {
      notificationId: notification.id,
      deliveryId,
      deduped: false,
    };
  }
}
