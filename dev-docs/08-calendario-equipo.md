# Calendario de equipo (DSP + Outlook)

Fuente de verdad del módulo `core/src/modules/calendar/`. Vista UI: `/calendar`.

## 1. Propósito

Mostrar en una sola pantalla la agenda de **todos** los usuarios DSP activos:

| Capa | Fuente | Requisito |
|------|--------|-----------|
| `dsp` | Tareas con fechas + `task_assignees` | Siempre |
| `outlook` | Microsoft Graph app-only `calendarView` por email de la persona | `MS_APP_ONLY_CALENDAR=true` + Application `Calendars.Read` |

Visibilidad MVP: cualquier usuario autenticado ve a todos (“todos ven a todos”).

## 2. Privacidad Outlook

- Eventos con sensibilidad privada / `isPrivate` → título **Ocupado**, `busyOnly: true`.
- Fallo al leer un buzón → warning en la respuesta; no tumba el request.

## 3. Azure (capa Outlook)

Mismo App Registration que OAuth delegado:

1. API permissions → **Application** → `Calendars.Read` → Admin consent.
2. `MS_APP_ONLY_CALENDAR=true` en envs.
3. Tenant debe ser el del municipio (no `common` para app-only típico; usar Tenant ID GUID).

Delegado (“Conectar Outlook”) sigue para mail y `/me`; la vista de equipo **no** usa tokens de terceros.

## 4. API

| Método | Ruta |
|--------|------|
| GET | `/api/calendar/people` |
| GET | `/api/calendar/team?from=&to=&personIds=&layers=dsp,outlook` |

`from` / `to`: fechas ISO (`YYYY-MM-DD`). `personIds`: UUIDs de persona separados por coma. `layers`: `dsp`, `outlook` o ambos.

## 5. Humo

```bash
TOKEN=…
curl -s "http://localhost:5080/api/calendar/people" -H "Authorization: Bearer $TOKEN" | jq
curl -s "http://localhost:5080/api/calendar/team?from=2026-10-01&to=2026-10-31&layers=dsp,outlook" \
  -H "Authorization: Bearer $TOKEN" | jq
```

## 6. Fuera de alcance

Sync bidireccional, crear eventos en Outlook, milestones (cuando exista la tabla), permisos por unidad/staff.
