'use client';

import { useEffect, useState } from 'react';
import { Alert, Button } from '@felipechandiadev/ui';
import type { InboxItem } from '../lib/types';
import { useNotifications } from './notifications-realtime-provider';

export function AlertsInboxClient({
  initialItems,
}: {
  initialItems: InboxItem[];
}) {
  const { recent, markRead, markAllRead, refresh } = useNotifications();
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    if (recent.length === 0) return;
    setItems((prev) => {
      const map = new Map(prev.map((i) => [i.deliveryId, i]));
      for (const r of recent) {
        map.set(r.deliveryId, r);
      }
      return [...map.values()].sort(
        (a, b) =>
          new Date(b.deliveredAt).getTime() - new Date(a.deliveredAt).getTime(),
      );
    });
  }, [recent]);

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button
          type="button"
          variant="outlined"
          size="sm"
          onClick={() => void refresh()}
        >
          Actualizar
        </Button>
        <Button
          type="button"
          variant="text"
          size="sm"
          onClick={() => void markAllRead().then(() => refresh())}
        >
          Marcar todas leídas
        </Button>
      </div>

      {items.length === 0 ? (
        <Alert variant="info">No hay notificaciones todavía.</Alert>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {items.map((item) => (
            <li
              key={item.deliveryId}
              style={{
                padding: '0.85rem 0',
                borderBottom:
                  '1px solid color-mix(in srgb, currentColor 12%, transparent)',
                opacity: item.status === 'unread' ? 1 : 0.75,
              }}
            >
              <strong style={{ display: 'block' }}>{item.title}</strong>
              {item.body ? (
                <p style={{ margin: '0.35rem 0', fontSize: '0.95rem' }}>
                  {item.body}
                </p>
              ) : null}
              <span style={{ fontSize: '0.8rem', opacity: 0.75 }}>
                {new Date(item.deliveredAt).toLocaleString('es-CL')} ·{' '}
                {item.kind}
                {item.status === 'unread' ? ' · sin leer' : ''}
              </span>
              {item.status === 'unread' ? (
                <div style={{ marginTop: '0.5rem' }}>
                  <Button
                    type="button"
                    variant="text"
                    size="sm"
                    onClick={() =>
                      void markRead(item.deliveryId).then(() =>
                        setItems((prev) =>
                          prev.map((p) =>
                            p.deliveryId === item.deliveryId
                              ? { ...p, status: 'read', readAt: new Date().toISOString() }
                              : p,
                          ),
                        ),
                      )
                    }
                  >
                    Marcar leída
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
