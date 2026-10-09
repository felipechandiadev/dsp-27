# Notifications (MVP)

Persistent in-app notifications + Socket.IO + email outbox (actor Outlook).

## Scope

- Domain kinds: `portfolio.task_assigned` (others reserved in `dev-docs/07-notificaciones.md`).
- Channels: deliveries (inbox) → WS `/realtime/notifications` → optional email outbox.
- Email sender: Microsoft Graph as **actor** user (Connect Outlook). Skip if not connected.

## Tables

`notifications`, `notification_deliveries`, `notification_outbox`

## REST

- `GET /notifications/inbox`
- `GET /notifications/unread-count`
- `PATCH /notifications/deliveries/:id/read`
- `POST /notifications/deliveries/mark-all-read`

## Realtime

- Namespace: `/realtime/notifications`
- Event: `notification:delivery`
- Auth: `handshake.auth.token` (Nest JWT)

## Env

| Variable | Default |
|----------|---------|
| `NOTIFICATION_DEDUP_WINDOW_MINUTES` | `15` |
| `NOTIFICATION_OUTBOX_POLL_MS` | `15000` |
| `NOTIFICATION_OUTBOX_BATCH_SIZE` | `20` |

Full design: `dev-docs/07-notificaciones.md`.
