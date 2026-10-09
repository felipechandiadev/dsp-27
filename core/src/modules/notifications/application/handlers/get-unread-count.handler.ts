import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUnreadCountQuery } from '../queries/get-unread-count.query';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepositoryPort,
} from '../ports/notification.repository.port';

@QueryHandler(GetUnreadCountQuery)
export class GetUnreadCountHandler
  implements IQueryHandler<GetUnreadCountQuery>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repo: NotificationRepositoryPort,
  ) {}

  async execute(query: GetUnreadCountQuery) {
    const count = await this.repo.countUnread(query.userId);
    return { count };
  }
}
