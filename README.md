# DSP-27

Monorepo privado para el **Plan de Seguridad Pública 2027**.

| Workspace | Stack | Puerto |
|-----------|--------|--------|
| `core/` | NestJS 11 (hexagonal + CQRS) | **5080** |
| `app/` | Next.js 16 + `@felipechandiadev/ui` (kai-ui local) | **5081** |

Guía: [`dev-docs/`](./dev-docs/README.md) · [Plan de desarrollo](./dev-docs/06-plan-desarrollo.md)

## Un solo comando

```bash
npm install
npm run env:dev          # → core/.env + app/.env.local
npm run migration:run
npm run seed
npm run dev              # Nest + Next en paralelo
```

- API: http://localhost:5080/api/health · docs http://localhost:5080/docs  
- UI: http://localhost:5081  

Design system: dependencia local `file:../kai-ui` → `@felipechandiadev/ui` (transpile + alias a `src` en `app/next.config.ts`).

Por separado: `npm run core:dev` · `npm run app:dev`

## Usuarios seed

| Username | Rol | Password (default) |
|----------|-----|--------------------|
| `direccion` | `direccion` | `direccion123` |
| `gestor` | `gestor` | `gestor123` |
| `prevencion` | `prevencion` | `prevencion123` |

Login por **username** (no email). Secretos solo en `envs/shared.env` / `.env` locales.

## Outlook (opcional)

Login DSP + **Conectar Outlook** (OAuth delegado → Graph). Configurar en `envs/shared.env` las `MS_*` (ver `dev-docs/05-envs.md`). Sin `MS_CLIENT_ID` el core arranca y `status.configured=false`.

En la UI: **Ajustes** → Conectar Outlook · **Correo** usa Graph delegado. **Calendario** de equipo = capa DSP + overlay Outlook app-only (`MS_APP_ONLY_CALENDAR`, ver `dev-docs/08-calendario-equipo.md`).

## Humo API

```bash
curl -s http://localhost:5080/api/health | jq
TOKEN=$(curl -s -X POST http://localhost:5080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"direccion","password":"direccion123"}' | jq -r .accessToken)
curl -s http://localhost:5080/api/plan -H "Authorization: Bearer $TOKEN" | jq
curl -s http://localhost:5080/api/integrations/microsoft/status \
  -H "Authorization: Bearer $TOKEN" | jq
curl -s http://localhost:5080/api/notifications/unread-count \
  -H "Authorization: Bearer $TOKEN" | jq
# Tras asignar una tarea (personId del seed):
# curl -s -X POST "http://localhost:5080/api/projects/tasks/$TASK_ID/assignees" \
#   -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
#   -d '{"personId":"…","assignmentRole":"executor"}' | jq
curl -s http://localhost:5080/api/notifications/inbox \
  -H "Authorization: Bearer $TOKEN" | jq
curl -s "http://localhost:5080/api/calendar/team?from=2026-10-01&to=2026-10-31&layers=dsp" \
  -H "Authorization: Bearer $TOKEN" | jq
```

Notificaciones: [`dev-docs/07-notificaciones.md`](./dev-docs/07-notificaciones.md) · Calendario equipo: [`dev-docs/08-calendario-equipo.md`](./dev-docs/08-calendario-equipo.md).
