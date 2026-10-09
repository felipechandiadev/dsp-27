'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IconButton } from '@felipechandiadev/ui';
import { useNotifications } from './notifications-realtime-provider';

export function NotificationBell() {
  const { unreadCount, recent, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="dsp-notif">
      <span className="dsp-notif__trigger">
        <IconButton
          icon="Bell"
          ariaLabel={
            unreadCount > 0
              ? `Notificaciones, ${unreadCount} sin leer`
              : 'Notificaciones'
          }
          variant="neutral"
          size="md"
          onClick={() => setOpen((v) => !v)}
        />
        {unreadCount > 0 ? (
          <span className="dsp-notif__badge" aria-hidden>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </span>

      {open ? (
        <>
          <div
            className="dsp-notif__backdrop"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="dsp-notif__panel" role="dialog" aria-label="Notificaciones">
            <div className="dsp-notif__head">
              <strong>Notificaciones</strong>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  className="dsp-notif__linkish"
                  onClick={() => void markAllRead()}
                >
                  Marcar todas
                </button>
              ) : null}
            </div>
            <ul className="dsp-notif__list">
              {recent.length === 0 ? (
                <li className="dsp-notif__empty">Sin notificaciones recientes</li>
              ) : (
                recent.map((item) => (
                  <li key={item.deliveryId}>
                    <button
                      type="button"
                      className={`dsp-notif__item${item.status === 'unread' ? ' is-unread' : ''}`}
                      onClick={() => {
                        if (item.status === 'unread') {
                          void markRead(item.deliveryId);
                        }
                      }}
                    >
                      <span className="dsp-notif__title">{item.title}</span>
                      {item.body ? (
                        <span className="dsp-notif__body">{item.body}</span>
                      ) : null}
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="dsp-notif__foot">
              <Link href="/notifications" onClick={() => setOpen(false)}>
                Ver todas
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
