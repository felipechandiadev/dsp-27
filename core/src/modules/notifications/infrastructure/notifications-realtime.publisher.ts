import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from '../presentation/notifications.gateway';
import {
  NotificationDeliveryPayload,
  RealtimePublisherPort,
} from '../application/ports/realtime.publisher.port';

@Injectable()
export class NotificationsRealtimePublisher implements RealtimePublisherPort {
  constructor(private readonly gateway: NotificationsGateway) {}

  emitToUser(userId: string, payload: NotificationDeliveryPayload): void {
    this.gateway.server
      ?.to(`user:${userId}`)
      .emit('notification:delivery', payload);
  }

  emitToRole(role: string, payload: NotificationDeliveryPayload): void {
    this.gateway.server
      ?.to(`role:${role}`)
      .emit('notification:delivery', payload);
  }
}
