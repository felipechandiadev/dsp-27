import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkAllReadCommand } from '../commands/mark-all-read.command';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepositoryPort,
} from '../ports/notification.repository.port';

@CommandHandler(MarkAllReadCommand)
export class MarkAllReadHandler
  implements ICommandHandler<MarkAllReadCommand>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repo: NotificationRepositoryPort,
  ) {}

  async execute(command: MarkAllReadCommand) {
    const updated = await this.repo.markAllRead(command.userId);
    return { updated };
  }
}
