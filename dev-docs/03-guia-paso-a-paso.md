# Guía paso a paso

Orden de construcción. Cada paso termina con algo que se puede ejecutar y comprobar. No se abre el paso siguiente con el anterior a medias.

Leer antes:

1. [Generalidades](./01-generalidades.md)
2. [Arquitectura del core](./02-arquitectura-core.md)
3. [Modelo de datos](./04-modelo-datos.md)
4. [Plan de desarrollo](./06-plan-desarrollo.md) — folders, libs, bootstrap y UI mobile first

El esqueleto de Nest se mira en `/Users/felipe/dev/kai/kai-core`. Persona / User / Staff y multimedia se miran en Civika (`civika-core` identity + multimedia). Se copia el hábito, no el ERP.

## Paso 0 — Decisiones ya cerradas

Quedan fijas para no rediscutirlas al scaffoldear:

- Repo `dsp-27`, carpetas `core/` (Nest) y, más adelante, `app/` (Next).
- PostgreSQL + PostGIS. Migraciones TypeORM. Sin `synchronize: true`.
- Hexagonal + CQRS (`@nestjs/cqrs`).
- API en `/api`. Alertas en el namespace Socket.IO `/realtime/alerts`.
- Archivos: un `STORAGE_DRIVER` activo (`local` u `r2`); entidad con `storage_key` + `storage_driver` por fila (portable si cambia el almacén).
- Identidad: `persons` (email) + `users` (username = login) + `staff` (funcionario); todo usuario es una persona.
- Seguimiento: `projects` → `tasks` → `subtasks` (máximo 3 niveles), fechas inicio/término, notas y adjuntos siempre en tarea/subtarea, GPS opcional.
- Plan: `plan_instruments` (misión; visión nullable) + O1–O4 enriquecidos (Cap. 3 del libro).
- Normas: `legal_norms` + análisis + obligaciones + PDF; ancla Cap. 1 → cartera.
- Trazabilidad: norma/obligación → O → proyecto / tarea / subtarea (cada nivel con N:M propia opcional).
- Multimedia polimórfica (`entity_type` + `entity_id`) + `work_notes`; no URLs sueltas.
- Una municipalidad. Roles de la orgánica objetivo, no multi-tenant.
- Códigos de cartera del libro: PRJ-1–PRJ-3, PRJ-5–PRJ-16, TAR-1–TAR-3.
- UI **mobile first**: toda pantalla se acepta primero en ~360–430px; ver [06-plan-desarrollo.md](./06-plan-desarrollo.md) §1.
- Estructura de folders y librerías: las de [06-plan-desarrollo.md](./06-plan-desarrollo.md); no inventar otra layout a mitad de camino.

**Listo cuando:** esta carpeta `dev-docs/` es la referencia y `GUIA-DESARROLLO.md` queda como borrador anterior.

## Paso 1 — Repo y entorno

Crear el workspace de npm con `core/` vacío de dominio, carpeta `envs/` según [05-envs.md](./05-envs.md) (`shared.env.example`, `core.env.example`), y scripts `core:dev`, `env:dev`, `migration:run`.

Plantillas con `STORAGE_DRIVER=local`, `DB_*`, `JWT_*`, `CORS_*`. Sin secretos reales en git.

Postgres + PostGIS (imagen `postgis/postgis` o Postgres del sistema). Base de desarrollo: `dsp27`.

**Listo cuando:** `npm run env:dev` genera `core/.env` y `npm run core:dev` arranca; `SELECT PostGIS_Version()` responde.

**Aún no:** módulos de negocio, Next, driver R2 como default, login de pantalla.

## Paso 2 — Esqueleto Nest

Dentro de `core/src/`:

- `main.ts`: prefijo `/api`, `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`), filtro global, CORS desde config, escucha en `::` para que localhost IPv6 no deje el socket mudo.
- `config/`: Joi (estilo Kai) que falla si faltan `JWT_SECRET` o `DB_*` / `DATABASE_URL`.
- `common/filters`: filtro HTTP.
- `app.module.ts`: importa config, TypeORM y el módulo `health`.

TypeORM apunta a Postgres. `migrations` es la única vía de esquema. `data-source.ts` sirve para el CLI de migraciones, separado del arranque de Nest, como en Kai.

**Listo cuando:** `GET /api/health` responde 200 y el log de arranque muestra el puerto. Una petición con un campo de más a un DTO de prueba responde 400.

## Paso 3 — PostGIS, Persona y User

Primera migración:

1. `CREATE EXTENSION IF NOT EXISTS postgis`.
2. Tabla `persons` (unicidad documento, `email` nullable, soft delete).
3. Tabla `users` con `persona_id` unique FK → `persons`, **`username` unique**, `password_hash`, `role`, `status` — **sin** email.
4. Registro estándar de TypeORM (`migrations`).

El health check ejecuta `SELECT PostGIS_Version()` y lo incluye en el JSON. Si la extensión no está, health falla.

Semilla de desarrollo: una `person` (con email de contacto) + un `user` con `username` (p. ej. `direccion`) y rol `direccion`; contraseña solo en `.env.local`, no en el repositorio.

**Listo cuando:** `migration:run` es repetible en una base vacía, health informa PostGIS y existe el par persona/usuario seed.

## Paso 4 — Auth

Módulo `auth` + lectura de `users` / `persons`.

- `POST /api/auth/login` con DTO **`username`** + contraseña (no email).
- JWT firmado con `JWT_SECRET` (`sub` = user id, claims `personaId`, `username`, `role`).
- `GET /api/auth/me` con guard Bearer (incluye email desde la persona).
- Contraseñas con bcrypt.
- El guard deja `user.id`, `user.personaId`, `user.username` y `user.role` en el request.

Handlers: `LoginCommand`, `GetMeQuery`. El repositorio de usuarios es un puerto.

**Listo cuando:** login con username devuelve token; `/me` devuelve rol, `personaId` y email de la persona; sin token responde 401.

## Paso 5 — Plan (misión / visión) y objetivos O1–O4

Módulo `plan`. Tablas: `plan_instruments`, `strategic_objectives` (fichas Cap. 3).

- Seed: plan 2027 con `mission_text` del libro; `vision_text` null hasta que exista.
- Seed O1–O4 con `rationale`, `verification`, `out_of_scope` tomados del Cap. 3.2.
- `GET /api/plan` y `GET /api/plan/objectives`; `PATCH` de misión/visión y estado del O.

**Listo cuando:** la API devuelve la misión 2027 y las cuatro fichas O con proyectos aún vacíos o tras el paso 6.

## Paso 6 — Marco normativo

Módulo `legal` + PDF vía `multimedia`.

- Seed `legal_norms` Cap. 1 (leyes, DS 97, boletín en trámite, decreto municipal).
- `GET/POST/PATCH /api/legal/norms`, `GET /api/legal/norms/:code` (incluye `pdfAsset`).
- `POST /api/legal/norms/:code/pdf` — PDF oficial (`entity_type=legal_norm`, `kind=document`, replace).
- Escritura: roles `direccion` y `administrativo`.
- UI normativa bajo hub Documentos: `/documents/norms` + `/documents/norms/:code` (redirects desde `/legal`); componente reutilizable `EntityAttachments`.
- `legal_norm_analyses` / CRUD de obligaciones: fase posterior (listado de obligaciones ya existe).

### Documentos / informes (hub)

- Hub `/documents` (Redactar · Biblioteca · Normativa · Tipos).
- `document_types.creation_mode` (`composed` \| `attachment`); seed `memo` + modos.
- Redactar `/documents/compose` → `POST /api/documents/reports`; Biblioteca `/documents/library`.
- `managed_documents` + folio `DOC`; API `/api/documents/reports`.
- UI Word-in-browser con BetterOffice (DOCX vía `body_asset_id`). Ver [14-documentos.md](./14-documentos.md).
- Tipos: `/documents/types` (antes `/document-types`).

**Listo cuando:** listado Cap. 1; detalle con metadatos; PDF subible y legible; `OBL-ORGANICA` enlazable a cartera.

## Paso 7 — Motor de cartera (proyecto → tarea → subtarea)

Módulo `portfolio`.

- `projects` + N:M a O + `obligation_projects` (vínculo obligación → PRJ).
- `tasks` / `subtasks` / `task_strategic_objectives` / `subtask_strategic_objectives` / `work_notes` / assignees / milestones / indicators.
- Proyecto, tarea y subtarea vinculan O de forma independiente (sin exigir O en el padre al crear subtareas).
- Semilla: 15 PRJ + 3 TAR con O del libro; obligaciones del paso 6 enlazadas a sus PRJ.

**Listo cuando:** PRJ-1, PRJ-5, TAR-3 con O; obligación orgánica → PRJ-1; subtarea creable sin O en la tarea; O de subtarea visible en plan; nota en el hilo.

## Paso 8 — Multimedia y notas (driver local)

Módulo `multimedia` + notas. `STORAGE_DRIVER=local`.

- `ObjectStoragePort` + `LocalDiskStorage`; cada alta guarda `storage_key` + `storage_driver=local`.
- `POST /api/multimedia` y `POST /api/notes` para task/subtask/project/`legal_norm`.
- PDF de prueba en Ley 21.802; imagen en subtarea.

**Listo cuando:** descarga OK; 403 si clasificación/rol no calzan. El adaptador R2 puede existir en código pero no ser el default.

## Paso 9 — Notificaciones, WebSocket y outbox email

Módulo `notifications` ([doc 07](./07-notificaciones.md)): persistir hecho + deliveries + gateway `/realtime/notifications` + outbox email (Outlook del actor). Primer disparador: asignación de tarea (`portfolio.task_assigned`). Generadores de hitos/ITS después.

**Listo cuando:** Socket.IO recibe `notification:delivery` y `GET /api/notifications/inbox` muestra la fila tras reconectar; sin Outlook del actor el outbox queda `skipped_no_sender` y la campanita igual funciona.

## Paso 10 — Staff, nómina y capacitaciones

Módulos `staff` (funcionarios) y `training` (expediente, art. 12°/13°/15°/16°, multimedia de certificados, query de nómina). Preferir `staff_id` en asignaciones. El funcionario puede crearse sin usuario; el email está en la persona.

**Listo cuando:** funcionario de prueba con curso PDF y aparece en la nómina.


## Paso 11 — ITS y licitaciones

Módulos `contracts` y `procurement` (PRJ-13 + ITS; ET de PRJ-5; alertas de incidencia).

**Listo cuando:** incidencia ITS por WebSocket; especificación `draft` con archivo.

## Paso 12 — Territorio y activos con PostGIS

Áreas de operación (`operation_area_types` + `operation_areas` con polígono PostGIS), UI `/areas` (tabs Áreas | Tipos) y Leaflet; ver [12-areas-operacion](./12-areas-operacion.md). Visitas GPS → `ST_Covers` y activos con Point quedan para una iteración posterior.

**Listo cuando (MVP áreas):** seed de tipos + 5 sectores Parral; API territory con GeoJSON; mapa permite dibujar/guardar un sector. **Listo cuando (visitas):** visita en Plaza de Armas entra en el polígono del sector (`ST_Covers`).

Tras áreas: **flujo operativo** (`incidencias` / `requerimientos` / `field_operations`) y UI Triage en `/triage` — ver [13-flujo-operativo](./13-flujo-operativo.md).

## Paso 13 — App Next (mobile first)

Cuando los pasos 4 a 9 responden por HTTP y socket. Scaffold según [06-plan-desarrollo.md](./06-plan-desarrollo.md): `app/` con App Router, features (actions → usecase → `*.request.ts`), shell mobile-first, solo `@felipechandiadev/ui`.

Pantallas: login, Estrategia (misión/visión/O), Normas (catálogo + PDF + análisis + obligaciones), cartera, ficha tarea/subtarea, alertas. Cada una se prueba primero en viewport móvil.

**Listo cuando:** `direccion` ve misión → O1 → obligación orgánica → PRJ-1; en PRJ-14 crea subtarea con nota, imagen y GPS; recibe alerta de hito; **todo el flujo usable en DevTools dispositivo móvil** (sin scroll horizontal ni dialogs ilegibles).

## Paso 14 — Cambiar a R2 (mismo modelo)

Pasar `STORAGE_DRIVER=r2` y rellenar `R2_*` ([05-envs.md](./05-envs.md)). El esquema de `multimedia_assets` **no** cambia.

- Altas nuevas → R2 (`storage_driver=r2`).
- Filas antiguas con `local` → se siguen leyendo desde disco vía el driver de la fila.
- Migración masiva de binarios: opcional; update de `storage_driver`/`storage_key` por fila, sin nuevas tablas.

**Listo cuando:** una subida nueva sale de R2; un PDF viejo `local` sigue descargando.

## Definición de hecho, en cada paso

**Core**

- DTO validado y rol en el guard cuando la ruta no es pública.
- Migración si el esquema cambió.
- Handler probado con puerto falso en los comandos que escriben.
- El controller no importa TypeORM ni el SDK de S3.
- Typecheck del core en verde.

**App (desde el paso 13)**

- Flujo actions → usecase → `*.request.ts`; sin `fetch` al core desde el cliente.
- UI solo con `@felipechandiadev/ui` + `src/shared`.
- Viewport móvil verificado (lista, ficha, form, dialog) antes del Done.

## Qué no hacer mientras se sigue esta guía

- No estimar montos de presupuesto.
- No abrir pantalla Next antes del paso 13.
- No entregar una pantalla “solo desktop”; mobile first es obligatorio (paso 13+).
- No inventar otra estructura de folders distinta a [06-plan-desarrollo.md](./06-plan-desarrollo.md).
- No guardar imágenes de televigilancia en `multimedia_assets`.
- No confiar en un `userId` que mande el cliente por el socket.
- No activar `synchronize`.
- No aplanar proyecto/tarea/subtarea en una sola tabla genérica.
- No poner contraseñas ni roles de sistema en `persons`.
- No poner email en `users` ni hacer login por correo (usar `username`).
- No exigir O en la tarea padre para crear subtareas (cada nivel gestiona su propia N:M a O).
- No sustituir el hilo de notas por un único campo texto editable.
- No pegar el articulado completo de una ley en `summary` (PDF + análisis).
- No tratar el PDF Vivliostyle como fuente de verdad en runtime.
- No guardar path absoluto o URL de R2 como verdad del archivo (usar `storage_key` + `storage_driver`).
- No asumir dos destinos de alta a la vez; un `STORAGE_DRIVER`.
