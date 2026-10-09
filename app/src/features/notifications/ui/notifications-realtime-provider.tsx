'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import type {
  InboxItem,
  NotificationDeliveryEvent,
} from '../lib/types';

type NotificationsContextValue = {
  unreadCount: number;
  recent: InboxItem[];
  refresh: () => Promise<void>;
  markRead: (deliveryId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

function apiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    'http://localhost:5080'
  );
}

export function NotificationsRealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const [unreadCount, setUnreadCount] = useState(0);
  const [recent, setRecent] = useState<InboxItem[]>([]);

  const refresh = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      setRecent([]);
      return;
    }
    const base = apiBase();
    try {
      const [countRes, inboxRes] = await Promise.all([
        fetch(`${base}/api/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }),
        fetch(`${base}/api/notifications/inbox?limit=8`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }),
      ]);
      if (countRes.ok) {
        const data = (await countRes.json()) as { count?: number };
        setUnreadCount(data.count ?? 0);
      }
      if (inboxRes.ok) {
        const data = (await inboxRes.json()) as { items?: InboxItem[] };
        setRecent(data.items ?? []);
      }
    } catch {
      // ignore transient network errors
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!token) return;
    let socket: Socket | null = null;
    try {
      socket = io(`${apiBase()}/realtime/notifications`, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });
      socket.on('notification:delivery', (payload: NotificationDeliveryEvent) => {
        setUnreadCount((c) => c + 1);
        setRecent((prev) => {
          const item: InboxItem = {
            deliveryId: payload.deliveryId,
            status: 'unread',
            deliveredAt: payload.deliveredAt,
            readAt: null,
            notificationId: payload.notificationId,
            kind: payload.kind,
            severity: payload.severity,
            title: payload.title,
            body: payload.body,
            payload: payload.payload,
            projectId: payload.projectId,
            taskId: payload.taskId,
          };
          return [item, ...prev.filter((p) => p.deliveryId !== item.deliveryId)].slice(
            0,
            8,
          );
        });
      });
    } catch {
      // socket optional
    }
    return () => {
      socket?.disconnect();
    };
  }, [token]);

  const markRead = useCallback(
    async (deliveryId: string) => {
      if (!token) return;
      await fetch(`${apiBase()}/api/notifications/deliveries/${deliveryId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      await refresh();
    },
    [token, refresh],
  );

  const markAllRead = useCallback(async () => {
    if (!token) return;
    await fetch(`${apiBase()}/api/notifications/deliveries/mark-all-read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    await refresh();
  }, [token, refresh]);

  const value = useMemo(
    () => ({ unreadCount, recent, refresh, markRead, markAllRead }),
    [unreadCount, recent, refresh, markRead, markAllRead],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    return {
      unreadCount: 0,
      recent: [],
      refresh: async () => undefined,
      markRead: async () => undefined,
      markAllRead: async () => undefined,
    };
  }
  return ctx;
}
