# Subsistema de notificaciones

Fuente de verdad del módulo `core/src/modules/notifications/`. Complementa [arquitectura](./02-arquitectura-core.md) y [modelo](./04-modelo-datos.md). Referencia de patrón: `kai-core` `src/modules/notifications/`.

## 1. Propósito y límites

**Es:** canal unificado para hechos de negocio que deben llegar a personas en la app (bandeja + tiempo real) y, cuando el `kind` lo define, también por correo.

**No es:** chat, despacho de Central, botón de pánico, ni un reemplazo del correo Outlook del usuario como cliente de mail (eso es [Microsoft Graph / Conectar Outlook](../README.md)).

| Canal | Obligatorio en MVP | Fallo |
|-------|---------------------|--------|
| Persistencia (`notifications` + `deliveries`) | Sí | Bloquea el publish |
| WebSocket | Sí (best-effort tras persistir) | La bandeja REST recupera al reconectar |
| Email (outbox) | Solo si el `kind` lo pide | No bloquea in-app; reintentos / skip |

## 2. Arquitectura

```text
Caso de uso (AssignTask, hito, …)
  → NotificationPublisherPort.publish(input)
       → INSERT notifications (+ dedup group_key)
       → INSERT notification_deliveries (por user destinatario)
       → RealtimePublisherPort.emit → sala user:{id} | role:{rol}
       → INSERT notification_outbox (si channel email)
  → OutboxWorker (@Interval)
       → claim pending → MailSenderPort (Outlook del actor) → sent|failed|skipped_*
```

Corte hexagonal (igual que Kai):

| Pieza | Responsabilidad |
|-------|-----------------|
| Gateway | Auth JWT del socket + join salas. Sin lógica de negocio |
| RealtimePublisher | Emite a salas. Sin HTTP |
| Publisher de dominio | Persiste + orquesta canales |
| Outbox worker | Envía correo async |
| Handlers de cartera | Solo llaman al puerto `publish`; no importan `socket.io` ni Graph |

Un solo proceso Nest escucha HTTP y WebSocket. Sin Redis/Bull en MVP.

## 3. Modelo de datos

### `notifications` (hecho canónico, inmutable en la práctica)

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `source` | varchar | `automation` \| `user` \| `system` |
| `domain` | varchar | `portfolio` \| `legal` \| `training` \| `system` |
| `kind` | varchar | p. ej. `portfolio.task_assigned` |
| `severity` | varchar | `info` \| `warning` \| `critical` |
| `title` | varchar | |
| `body` | text nullable | |
| `payload` | jsonb | `{ taskId, projectId, … }` |
| `group_key` | varchar nullable | Dedup |
| `actor_user_id` | uuid nullable FK → users | Quién originó |
| `project_id` / `task_id` | uuid nullable | Atajos de navegación |
| `created_at` / `updated_at` | timestamptz | |

Índice: `(group_key, created_at)` para dedup. Ventana: `NOTIFICATION_DEDUP_WINDOW_MINUTES` (default 15).

### `notification_deliveries` (bandeja por usuario)

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `notification_id` | uuid FK | |
| `user_id` | uuid FK → users | |
| `status` | varchar | `unread` \| `read` \| `dismissed` |
| `read_at` / `dismissed_at` | timestamptz nullable | |
| `delivered_at` | timestamptz | |
| timestamps | | |

Índice inbox: `(user_id, status, delivered_at DESC)`.

### `notification_outbox` (canal email)

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `notification_id` | uuid FK | |
| `channel` | varchar | `email` |
| `status` | varchar | ver abajo |
| `to_email` | varchar nullable | |
| `subject` / `body_html` | text | |
| `actor_user_id` | uuid nullable | Remitente Graph |
| `attempts` / `max_attempts` | int | default max 5 |
| `next_attempt_at` | timestamptz | |
| `last_error` | text nullable | |
| timestamps | | |

Estados: `pending` → `processing` → `sent` \| `failed` \| `skipped_no_sender` \| `skipped_no_recipient`.

Backoff: `next_attempt_at = now + min(2^attempts, 60) minutes` tras fallo.

## 4. Canales y política de correo

### In-app + WebSocket

Siempre que haya `user_id` destinatario. Si la persona asignada **no tiene** `users`, no hay delivery in-app (puede haber email si hay `persons.email`).

### Email (MVP)

- Remitente: **Outlook del `actor_user_id`** (tokens en `user_oauth_accounts`, provider `microsoft`).
- Destinatario: `persons.email` del asignado (futuro: `staff.work_email`).
- Sin Outlook del actor → `skipped_no_sender` (in-app intacto).
- Sin email del destinatario → `skipped_no_recipient`.

### Fase posterior (no implementada)

Buzón institucional con client credentials Graph; fallback cuando el actor no conectó Outlook.

## 5. Flujo: asignación de tarea

```text
POST /api/projects/tasks/:taskId/assignees { personId, assignmentRole? }
  → INSERT task_assignees (assigned_by_user_id = JWT sub)
  → publish {
       kind: portfolio.task_assigned,
       groupKey: task_assigned:{taskId}:{personId},
       audienceUserId: user de esa persona (si existe),
       email: true,
       actorUserId: JWT sub
     }
```

## 6. Catálogo de `kind` (MVP)

| kind | Dominio | Email | Notas |
|------|---------|-------|--------|
| `portfolio.task_assigned` | portfolio | Sí | Implementado |
| `portfolio.milestone_due_soon` | portfolio | No | Reservado |
| `portfolio.milestone_overdue` | portfolio | No | Reservado |
| `legal.obligation_due` | legal | No | Reservado |
| `training.deadline_soon` | training | No | Reservado |
| `contracts.its_incident` | system | No | Reservado |

## 7. API REST

Prefijo: `/api/notifications`. JWT obligatorio.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/inbox?limit=30` | Deliveries del usuario + datos de la notificación |
| GET | `/unread-count` | `{ count }` |
| PATCH | `/deliveries/:id/read` | Marca leída (solo dueño) |
| POST | `/deliveries/mark-all-read` | Todas unread → read |

Asignaciones (portfolio):

| Método | Ruta |
|--------|------|
| POST | `/projects/tasks/:taskId/assignees` |
| GET | `/projects/tasks/:taskId/assignees` |

## 8. WebSocket

- Namespace: `/realtime/notifications`
- Auth: `handshake.auth.token` = access JWT Nest. El gateway verifica firma; **no** acepta `userId` del cliente.
- Salas: `user:{userId}`, `role:{role}` (join automático tras auth).
- Evento salida: `notification:delivery`

Payload:

```json
{
  "deliveryId": "uuid",
  "notificationId": "uuid",
  "kind": "portfolio.task_assigned",
  "severity": "info",
  "title": "…",
  "body": "…",
  "payload": {},
  "projectId": null,
  "taskId": "uuid",
  "deliveredAt": "ISO-8601"
}
```

La bandeja histórica siempre vía REST. El WS solo empuja novedades.

## 9. Seguridad

- REST y WS usan el mismo `JWT_SECRET`.
- Delivery/read solo del `user_id` del token.
- Outbox no expone tokens; el worker obtiene access token cifrado del actor.
- No loguear cuerpos de correo con datos sensibles en nivel `info`.

## 10. Operación y envs

```text
NOTIFICATION_DEDUP_WINDOW_MINUTES=15
NOTIFICATION_OUTBOX_POLL_MS=15000
NOTIFICATION_OUTBOX_BATCH_SIZE=20
```

### Humo

```bash
TOKEN=$(curl -s -X POST http://localhost:5080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"direccion","password":"direccion123"}' | jq -r .accessToken)

# Asignar (usar un taskId real del seed / portfolio)
curl -s -X POST "http://localhost:5080/api/projects/tasks/$TASK_ID/assignees" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"personId":"…","assignmentRole":"executor"}' | jq

curl -s http://localhost:5080/api/notifications/inbox \
  -H "Authorization: Bearer $TOKEN" | jq
curl -s http://localhost:5080/api/notifications/unread-count \
  -H "Authorization: Bearer $TOKEN" | jq
```

Checklist WS: cliente Socket.IO conecta a `http://localhost:5080/realtime/notifications` con `auth.token`; tras assign, recibe `notification:delivery`.

## 11. DoD y fases

**DoD MVP**

- [ ] Migración aplicada; tablas presentes.
- [ ] Assign crea delivery; inbox la muestra tras reconectar sin WS.
- [ ] WS emite con JWT válido.
- [ ] Con Outlook del actor: outbox `sent`. Sin Outlook: `skipped_no_sender` e in-app OK.
- [ ] Doc 07 + README del módulo alineados al código.

**Fuera / después:** buzón institucional, generadores de hitos, preferencias por kind, Redis adapter multi-instancia, Web Push.
