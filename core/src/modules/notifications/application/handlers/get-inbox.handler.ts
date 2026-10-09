import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInboxQuery } from '../queries/get-inbox.query';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepositoryPort,
} from '../ports/notification.repository.port';

@QueryHandler(GetInboxQuery)
export class GetInboxHandler implements IQueryHandler<GetInboxQuery> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repo: NotificationRepositoryPort,
  ) {}

  async execute(query: GetInboxQuery) {
    const items = await this.repo.listInbox(query.userId, query.limit);
    return {
      items: items.map(({ delivery, notification }) => ({
        deliveryId: delivery.id,
        status: delivery.status,
        deliveredAt: delivery.deliveredAt,
        readAt: delivery.readAt,
        notificationId: notification.id,
        kind: notification.kind,
        severity: notification.severity,
        title: notification.title,
        body: notification.body,
        payload: notification.payload,
        projectId: notification.projectId,
        taskId: notification.taskId,
      })),
    };
  }
}
