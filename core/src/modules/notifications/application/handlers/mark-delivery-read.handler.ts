import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkDeliveryReadCommand } from '../commands/mark-delivery-read.command';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepositoryPort,
} from '../ports/notification.repository.port';

@CommandHandler(MarkDeliveryReadCommand)
export class MarkDeliveryReadHandler
  implements ICommandHandler<MarkDeliveryReadCommand>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repo: NotificationRepositoryPort,
  ) {}

  async execute(command: MarkDeliveryReadCommand) {
    const row = await this.repo.markRead(
      command.deliveryId,
      command.userId,
    );
    if (!row) {
      throw new NotFoundException('Notificación no encontrada');
    }
    return { id: row.id, status: row.status, readAt: row.readAt };
  }
}
