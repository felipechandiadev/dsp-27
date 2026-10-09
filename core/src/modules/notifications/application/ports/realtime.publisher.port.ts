export const REALTIME_PUBLISHER = Symbol('REALTIME_PUBLISHER');

export type NotificationDeliveryPayload = {
  deliveryId: string;
  notificationId: string;
  kind: string;
  severity: string;
  title: string;
  body: string | null;
  payload: Record<string, unknown>;
  projectId: string | null;
  taskId: string | null;
  deliveredAt: string;
};

export interface RealtimePublisherPort {
  emitToUser(userId: string, payload: NotificationDeliveryPayload): void;
  emitToRole(role: string, payload: NotificationDeliveryPayload): void;
}
