export type InboxItem = {
  deliveryId: string;
  status: string;
  deliveredAt: string;
  readAt: string | null;
  notificationId: string;
  kind: string;
  severity: string;
  title: string;
  body: string | null;
  payload: Record<string, unknown>;
  projectId: string | null;
  taskId: string | null;
};

export type NotificationDeliveryEvent = {
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
