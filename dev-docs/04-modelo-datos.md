# Modelo de datos

Esquema de negocio del core. Complementa la [arquitectura](./02-arquitectura-core.md). Las migraciones TypeORM implementan estas tablas; no se inventan columnas en el código fuera de este documento.

Referencias de patrón:

| Pieza | Fuente |
|-------|--------|
| Persona / User / Employee | Civika (`civika-core` identity + employees; `docs/Entidades Postgres - Vórtice.md`) |
| Multimedia polimórfica | Civika / Kai: `entityType` + `entityId`; `storage_key` + driver por fila (local **o** R2) |
| Geography | PostGIS `geography(Point|Polygon, 4326)` como en Civika infracciones/eventos |

## Mapa

```text
persons (email, RUT, nombre)
   │ 1:0..1                │ 1:0..1
   └── users (username)    └── staff / funcionarios
       login = username        (personal afecto DSP)

plan_instruments (año, misión, visión?)
  └── strategic_objectives (O1–O4)
         └── N:M → projects, tasks

legal_norms (+ PDF multimedia)
  ├── legal_norm_analyses
  └── legal_obligations → O y/o projects   (ancla Cap. 1 → cartera)

projects (PRJ-* / TAR-*)
   ├── tasks                    starts_on / ends_on, notes, multimedia
   │      └── subtasks          starts_on / ends_on, notes, multimedia, location?
   │             └── task_assignees → person_id | staff_id
   ├── milestones
   └── indicators

work_notes ────────── entity_type + entity_id   (task | subtask | project)
multimedia_assets ── entity_type + entity_id
notifications ── group_key, kind, payload
  ├── notification_deliveries ── user_id (bandeja)
  └── notification_outbox ── channel email (async)
```

Ideas fijas:

1. **Seguimiento** = árbol de tres niveles (proyecto → tarea → subtarea) con estado, avance, fechas de inicio/término, notas y adjuntos.
2. **Plan vivo** = instrumento anual (misión, visión opcional) + O1–O4 enriquecidos, espejo del libro Cap. 3.
3. **Marco normativo** = norma + análisis + obligaciones + PDF; ancla Cap. 1 y matriz obligación → acción.
4. **Trazabilidad** = norma/obligación → O → proyecto → tarea → subtarea.
5. **Identidad** = Persona ≠ Usuario ≠ Funcionario; todo usuario es una persona; login = `username` (el email vive en la persona).
6. **Evidencia** = multimedia + notas; un driver de alta (local u R2); fila con `storage_key` + `storage_driver` para no romper el modelo al cambiar de almacén.

## 1. Identidad — Persona, Usuario, Funcionario

Tres entidades separadas (patrón Civika / Employee). Una sola municipalidad (sin `municipality_id` en MVP).

```text
Persona          → quién es (civil)
Usuario          → qué puede hacer en la app (cuenta)
Funcionario      → vínculo laboral / personal afecto DSP (staff)
```

| Relación | Cardinalidad | Regla |
|----------|--------------|--------|
| Usuario → Persona | 1:1 obligatorio | Todo usuario **es** una persona (`persona_id`). No hay cuenta fantasma |
| Funcionario → Persona | 1:1 obligatorio | Todo funcionario **es** una persona |
| Persona → Usuario | 0..1 | Puede no tener cuenta (contratista, vecino, inspector aún sin login) |
| Persona → Funcionario | 0..1 | Puede no ser personal afecto |

**Correo electrónico:** vive en la **persona** (y, si hace falta un correo institucional distinto, opcionalmente en funcionario). **No** en `users`.

**Login:** solo **`users.username`** + contraseña. El email no es credencial de acceso.

### `persons`

Quién es. Sin contraseña. Soft delete.

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `code` | varchar(16) unique nullable | Folio interno opcional |
| `first_name` | varchar | |
| `last_name` | varchar | |
| `document_type` | varchar | `RUN` \| `RUT` \| `PASSPORT` \| `DNI` |
| `document_number` | varchar | |
| `email` | varchar nullable | Contacto; **no** es el login |
| `phone` | varchar nullable | |
| `address` | varchar nullable | |
| `created_at` / `updated_at` / `deleted_at` | timestamptz | |

Índice único: `(document_type, document_number)`. Índice opcional en `email` (no único obligatorio: puede repetirse o quedar vacío).

Reglas:

- Puede existir **sin** `users` y **sin** `staff`.
- Soft delete: tareas, actas y nómina históricas siguen apuntando al mismo `id`.

### `users`

Cuenta de acceso. El nombre de usuario es lo que se usa para entrar.

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `persona_id` | uuid unique FK → persons | Obligatorio |
| `username` | varchar unique | **Login** (p. ej. `jrodriguez` o RUT normalizado) |
| `password_hash` | varchar | bcrypt; nunca en respuestas API |
| `role` | varchar | Rol de sistema DSP (ver generalidades) |
| `status` | varchar | `active` \| `suspended` \| `inactive` |
| `last_login_at` | timestamptz nullable | |
| timestamps + `deleted_at` | | |

Sin columna `email`. El correo se lee vía `persona`.

Auth: `POST /api/auth/login` con `{ username, password }`. JWT: `sub` = `user.id`, claims `personaId`, `username`, `role`. El guard no confía en un `userId` enviado por el cliente.

`GET /api/auth/me` puede devolver username + datos de la persona (nombre, email) para la UI.

### `user_oauth_accounts`

Tokens OAuth de integraciones externas (MVP: Microsoft / Outlook). Un usuario puede conectar su buzón sin cambiar el login DSP.

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `user_id` | uuid FK → users | |
| `provider` | varchar | `microsoft` |
| `account_email` | varchar nullable | Email del perfil Graph (`/me`) |
| `access_token_enc` | text | Access token cifrado (AES-256-GCM) |
| `refresh_token_enc` | text | Refresh token cifrado |
| `expires_at` | timestamptz | Expiración del access token |
| `scopes` | text | Scopes concedidos (espacio-separados) |
| `created_at` / `updated_at` | timestamptz | |

Único: `(user_id, provider)`. API: `GET/DELETE /api/integrations/microsoft`, mail/calendar bajo el mismo prefijo.

### `staff` (funcionarios)

Personal afecto a la Dirección (análogo a `employees` en Civika). Capa Ley 21.802 / DS 97. No es la cuenta de login.

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `persona_id` | uuid unique FK → persons | |
| `unit` | varchar | `analisis` \| `prevencion` \| `operaciones` \| `direccion` \| `grd` |
| `ds97_profile` | varchar nullable | `fiscalizador` \| `coadyuvante` \| `no_operativo` |
| `inspector_quality_status` | varchar | `none` \| `pending` \| `granted` \| `revoked` |
| `appointment_at` | date nullable | Inicio del reloj art. 13° |
| `prior_to_law` | boolean | true si ejercía antes del 11-ago-2026 |
| `employee_number` | varchar nullable | Folio municipal |
| `work_email` | varchar nullable | Solo si el correo institucional **difiere** del de la persona; en MVP suele bastar `persons.email` |
| `status` | varchar | `active` \| `on_leave` \| `terminated` |
| timestamps + `deleted_at` | | |

Un funcionario puede existir **sin** usuario (expediente y email en persona; aún no entra a la app). Al crear la cuenta se elige un `username`; no se fuerza el email como login.

La nómina (art. 15°) es una **query** sobre `staff` con `inspector_quality_status = granted`, no una tabla de sueldos.

Detalle de requisitos art. 12°, declaración art. 16° y capacitaciones: tablas hijas en `staff` / `training`, siempre con `staff_id` y adjuntos vía multimedia.

## 2. Instrumento del plan — misión, visión y O1–O4

Fuente: Capítulos 0 y 3 del libro Vivliostyle (`seguridad-2027/dev-docs/book/`). La app no almacena el PDF del libro: guarda las piezas operables (misión, visión, objetivos, normas).

### `plan_instruments`

Una fila por año de planificación (p. ej. 2027).

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `year` | int unique | `2027` |
| `title` | varchar | Planificación DSP / cartera del año |
| `version` | varchar | Control documental Cap. 0 |
| `status` | varchar | `draft` \| `active` \| `archived` |
| `mission_text` | text | Misión Cap. 3.1 |
| `vision_text` | text nullable | Visión; vacía hasta que la Dirección la redacte |
| `prioritization_notes` | text nullable | Criterios Cap. 3.4 |
| `results_expected_text` | text nullable | Resultados al 31-dic Cap. 3.3 |
| `starts_on` / `ends_on` | date nullable | Ventana del instrumento |
| timestamps | | |

Reglas: un solo `active` por municipalidad en MVP. Edición reservada a `direccion` / `analisis_datos`.

### `strategic_objectives`

Ficha del Cap. 3.2 (no solo código y título).

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `plan_instrument_id` | uuid FK → plan_instruments | |
| `code` | varchar | `O1`…`O4`; único por plan |
| `title` | varchar | Enunciado corto |
| `rationale` | text nullable | “Por qué este objetivo” |
| `verification` | text nullable | “Cómo se verifica en 2027” |
| `out_of_scope` | text nullable | “Qué no incluye” |
| `diagnosis_links` | text nullable | Problemas Cap. 2 que cierra (texto; FK a diagnóstico después) |
| `status` | varchar | `on_track` \| `attention` \| `done` |
| timestamps | | |

Seed: O1–O4 del libro bajo el plan 2027. No se borran mientras el plan esté activo.

### Tablas N:M (cartera)

| Tabla | Columnas | Uso |
|-------|----------|-----|
| `project_strategic_objectives` | `project_id`, `strategic_objective_id` | Un proyecto puede aportar a varios O (PRJ-14 → O2, O3, O4) |
| `task_strategic_objectives` | `task_id`, `strategic_objective_id` | Vínculo opcional de la tarea a uno o más O |

**Subtareas:** heredan la trazabilidad del padre (sin N:M propia en MVP).

### Reglas de negocio (objetivos en tareas)

1. Una **tarea sin subtareas** puede existir **sin** filas en `task_strategic_objectives`.
2. Al **crear la primera subtarea**, la tarea **debe** tener al menos un O → si no, 400.
3. Quitar el último vínculo O de una tarea con subtareas activas → 400.
4. Enlazar un O que el proyecto no declara: permitido en MVP con advertencia en UI.
5. El **proyecto** del libro siempre declara al menos un O (seed y alta).

Cadena de trazabilidad estratégica:

```text
plan_instrument
  → strategic_objective (O#)
      → project(s)
          → task(s)  [O obligatorio si hay subtareas]
              → subtask(s)  [heredan]
```

## 3. Marco normativo — normas, análisis y obligaciones

Fuente: Capítulo 1 del libro y anexo 7.1 (matriz obligación → acción). Tres capas: el instrumento legal, el análisis de la Dirección, y las obligaciones que anclan la cartera.

### `legal_norms`

Catálogo de leyes, decretos, reglamentos y proyectos de ley del marco.

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `code` | varchar unique | `LEY-21802`, `DS-MSP-97-2026`, `DE-03883-2026`, `BOL-18525-06` |
| `kind` | varchar | `law` \| `decree` \| `regulation` \| `bill` \| `other` |
| `number_label` | varchar | `Ley N.º 21.802` |
| `short_title` | varchar | Título corto |
| `status` | varchar | `in_force` \| `in_process` \| `repealed` \| `superseded` |
| `published_on` | date nullable | |
| `effective_on` | date nullable | |
| `summary` | text nullable | Párrafo tipo Cap. 1.x |
| `sort_order` | int | Orden de lectura del marco (1.1 → 1.7) |
| timestamps + `deleted_at` | | |

**PDF / texto oficial:** `multimedia_assets` con `entity_type = legal_norm` (kind `document`). No se pega el articulado completo en una columna.

Seed mínimo Cap. 1:

| code | number_label |
|------|----------------|
| `LEY-21802` | Ley N.º 21.802 |
| `LEY-18695` | Ley N.º 18.695 |
| `LEY-20965` | Ley N.º 20.965 |
| `DS-MSP-97-2026` | DS MSP N.º 97/2026 |
| `LEY-19628` | Ley N.º 19.628 |
| `LEY-21719` | Ley N.º 21.719 |
| `BOL-18525-06` | Boletín N.º 18.525-06 (ley corta; `kind=bill`, `status=in_process`) |
| `DE-03883-2026` | Decreto Exento N.º 03883/2026 |

También relevantes en cargos/compras (fuera del Cap. 1 corto, pero útiles): `LEY-19886`, `LEY-20285` — se pueden cargar después sin cambiar el esquema.

### `legal_norm_analyses`

Análisis propio de la Dirección sobre la norma (no es el texto legal).

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `legal_norm_id` | uuid FK → legal_norms | |
| `plan_instrument_id` | uuid nullable FK → plan_instruments | Análisis para el año 2027 |
| `title` | varchar | p. ej. “Implicancias para DSP Parral 2027” |
| `body` | text | Análisis (markdown/texto); seed desde Cap. 1 |
| `status` | varchar | `draft` \| `published` |
| `author_user_id` | uuid nullable FK → users | |
| timestamps + `deleted_at` | | |

Una norma puede tener varios análisis (borrador / publicado). El PDF sigue en multimedia de la norma.

### `legal_obligations`

Obligaciones operativas que anclan la cartera (callout Cap. 1 y matriz 7.1).

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `legal_norm_id` | uuid FK → legal_norms | |
| `code` | varchar nullable unique | `OBL-ORGANICA`, `OBL-PLAN-COMUNAL`, … |
| `article_ref` | varchar nullable | `art. 15°`, `art. undécimo transitorio` |
| `description` | text | Obligación en lenguaje de la Dirección |
| `deadline_on` | date nullable | Plazo si existe |
| `status` | varchar | `open` \| `in_progress` \| `met` \| `waived` |
| timestamps + `deleted_at` | | |

### Vínculos de obligaciones

| Tabla | Columnas | Uso |
|-------|----------|-----|
| `obligation_strategic_objectives` | `legal_obligation_id`, `strategic_objective_id` | Obligación sostiene un O |
| `obligation_projects` | `legal_obligation_id`, `project_id` | Obligación → PRJ/TAR (ancla de cartera) |

Ejemplos del libro: orgánica en Reglamento → PRJ-1 → O1; Plan Comunal en plazo → PRJ-3 → O1; EPP → PRJ-12 → O1; calidad inspector → TAR-3 → O1.

Cadena normativa:

```text
legal_norm (+ PDF)
  → legal_norm_analysis
  → legal_obligation
        → strategic_objective / project
              → task → subtask
```

## 4. Cartera — Proyecto, tarea, subtarea

Máximo tres niveles. No hay árbol más profundo.

Estados comunes: `pending` \| `in_progress` \| `blocked` \| `done` \| `cancelled`.

Capacidades **siempre** disponibles en tarea y subtarea (no son módulos aparte ni flags):

| Capacidad | Cómo |
|-----------|------|
| Adjuntos (imagen / documento) | `multimedia_assets` con `entity_type` = `task` \| `subtask` |
| Notas de trabajo | `work_notes` con el mismo vínculo polimórfico |
| Fecha de inicio y de término | `starts_on`, `ends_on` |
| Objetivo operativo (texto) | `objective_text` — qué se busca con ese trabajo |
| Objetivos estratégicos | N:M vía `task_strategic_objectives` (ver §2–3); subtarea hereda |

### `projects`

Ficha del libro (PRJ-\* o TAR-\*).

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `code` | varchar unique | `PRJ-5`, `TAR-3`, … |
| `kind` | varchar | `project` \| `portfolio_task` (TAR del libro) |
| `title` | varchar | |
| `status` | varchar | |
| `lead_role` | varchar nullable | Rol que conduce (orgánica objetivo) |
| `summary` | text nullable | |
| `problem` | text nullable | Molde del libro |
| `scope` | text nullable | |
| `legal_milestone` | text nullable | |
| `progress_override` | numeric(5,2) nullable | Solo si se fuerza % a mano |
| `starts_on` / `ends_on` | date nullable | Ventana del proyecto |
| timestamps + `deleted_at` | | |

Los O estratégicos **no** van en una columna `objective`: van en `project_strategic_objectives`.

`TAR-*` del libro son filas en `projects` con `kind = portfolio_task`. No se confunden con `tasks` de ejecución.

### `tasks`

Trabajo bajo un proyecto.

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `project_id` | uuid FK → projects | |
| `code` | varchar nullable | Código local opcional |
| `title` | varchar | |
| `description` | text nullable | Alcance / detalle estático |
| `objective_text` | text nullable | Objetivo operativo de la tarea (qué lograr) |
| `status` | varchar | |
| `lead_role` | varchar nullable | |
| `location` | geography(Point, 4326) nullable | GPS opcional |
| `location_accuracy_m` | numeric nullable | |
| `located_at` | timestamptz nullable | Cuándo se fijó el punto |
| `starts_on` | date nullable | Fecha de inicio planificada |
| `ends_on` | date nullable | Fecha de término planificada |
| `sort_order` | int default 0 | |
| timestamps + `deleted_at` | | |

Check de aplicación: si `starts_on` y `ends_on` vienen ambas, `ends_on >= starts_on`.

Índice `GIST` sobre `location`.

La UI de ficha de tarea **siempre** muestra pestañas o bloques: Resumen · Notas · Adjuntos · Subtareas · Asignaciones. No hay tarea “sin notas” ni “sin adjuntos” como tipo distinto: la lista puede estar vacía, la capacidad no.

### `subtasks`

Ejecución concreta bajo una tarea (visita, acta, tramo de ET).

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `task_id` | uuid FK → tasks | |
| `title` | varchar | |
| `description` | text nullable | |
| `objective_text` | text nullable | Objetivo operativo de la subtarea |
| `status` | varchar | |
| `location` | geography(Point, 4326) nullable | GPS típico en terreno |
| `location_accuracy_m` | numeric nullable | |
| `located_at` | timestamptz nullable | |
| `starts_on` | date nullable | Inicio |
| `ends_on` | date nullable | Término |
| `sort_order` | int default 0 | |
| timestamps + `deleted_at` | | |

Misma regla de fechas que en tareas. Misma capacidad permanente de notas y adjuntos (`entity_type = subtask`).

Reglas de GPS:

- Proyecto: sin punto (o se deriva del territorio en módulos posteriores).
- Tarea / subtarea: punto **opcional**. Una subtarea de visita lo lleva; “redactar bases” no.
- SRID 4326. Distancias con `ST_Distance` en metros.

### `work_notes` (notas de trabajo)

Hilo de comentarios / bitácora sobre el ítem. Distinto de `description` y de `objective_text` (esos son campos de ficha; las notas son cronológicas).

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `entity_type` | varchar | `project` \| `task` \| `subtask` |
| `entity_id` | uuid | |
| `body` | text | Contenido de la nota |
| `author_user_id` | uuid FK → users | Quién escribió |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `deleted_at` | timestamptz nullable | Soft delete |

Índice: `(entity_type, entity_id, created_at)`.

En MVP, notas son obligatorias como **capacidad** (endpoints siempre expuestos), no como “debe existir al menos una nota”. Lo mismo aplica a multimedia.

### Avance

```text
% subtarea   = 100 si status = done, si no 0
% tarea      = promedio de subtareas; si no hay subtareas, 100 si done else 0
% proyecto   = progress_override si no es null;
               si no, promedio de % de sus tasks
```

El tablero muestra estado + % derivado + ventana `starts_on`/`ends_on`. No se exige meta monetaria.

Lectura por objetivo estratégico: proyectos y tareas enlazados a ese O, con % agregado (promedio de proyectos del O, o de tareas del O según la vista).

### `task_assignees` (vinculaciones)

Quién ejecuta o responde por una tarea o subtarea.

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `task_id` | uuid nullable FK → tasks | Exactamente uno de task/subtask |
| `subtask_id` | uuid nullable FK → subtasks | |
| `person_id` | uuid nullable FK → persons | Exactamente uno de person/staff |
| `staff_id` | uuid nullable FK → staff | Preferido si es personal afecto |
| `assignment_role` | varchar | `owner` \| `executor` \| `reviewer` \| `support` |
| `assigned_at` | timestamptz | |
| `unassigned_at` | timestamptz nullable | Histórico sin borrar fila |
| `assigned_by_user_id` | uuid nullable FK → users | Quién asignó (actor de notificación/correo) |

Check: `(task_id IS NOT NULL) <> (subtask_id IS NOT NULL)` en XOR; igual para person/staff.

Asignar por `person_id` / `staff_id`, no por `username`: si cambia la cuenta, el historial de ejecución queda.

### `milestones` e `indicators`

Cuelgan del **proyecto** (ficha del plan).

| Tabla | Campos clave |
|-------|----------------|
| `milestones` | `project_id`, `title`, `due_on`, `status` |
| `indicators` | `project_id`, `name`, `kind` (`result` \| `progress`), `measure_how` text, `target_value` nullable |

## 5. Multimedia

Una capa para imágenes y documentos. Sin `document_url` sueltos en tablas de negocio. Tarea y subtarea **siempre** pueden adjuntar (`entity_type` `task` / `subtask`); la lista vacía es válida. Las leyes adjuntan PDF con `entity_type = legal_norm`.

### Un driver activo; entidad portable

- El env define **un** destino para altas: `STORAGE_DRIVER=local` **o** `r2` (no ambos como destino habitual).
- La entidad es **agnóstica del backend**: no hay tablas ni columnas distintas por almacén. Una sola `multimedia_assets`.
- Al cambiar de local a R2 (o al revés) **no** hace falta rediseñar el esquema. Solo cambia el adaptador de `put` y, si se migran binarios, se actualiza `storage_driver` / `storage_key` en las filas afectadas.
- Lectura y borrado usan siempre el `storage_driver` **de la fila**, para no perder archivos subidos antes del cambio de env.

### `multimedia_assets`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid PK | |
| `entity_type` | varchar | Ver catálogo abajo |
| `entity_id` | uuid | Dueño |
| `kind` | varchar | `image` \| `document` |
| `mime_type` | varchar | |
| `original_name` | varchar | |
| `storage_key` | varchar | Clave lógica; **no** path absoluto ni URL de R2 |
| `storage_driver` | varchar | `local` \| `r2` — congelado al subir; lectura por este campo |
| `byte_size` | int | |
| `checksum` | varchar nullable | |
| `classification` | varchar | `interno` \| `reservado` \| `personal` (art. 22°) |
| `sort_order` | int default 0 | |
| `uploaded_by_user_id` | uuid nullable FK → users | |
| `created_at` / `deleted_at` | timestamptz | Soft delete |

Índice: `(entity_type, entity_id, sort_order)`.

Prohibido: columnas `local_path` y `r2_url` en paralelo; entidades `DocumentLocal` / `DocumentR2`.

### Catálogo `entity_type` (MVP)

| Valor | Dueño | Ejemplos |
|-------|--------|----------|
| `project` | projects.id | Folleto PRJ-14, bases del proyecto |
| `task` | tasks.id | Borrador de ET |
| `subtask` | subtasks.id | Foto de visita, acta de punto |
| `legal_norm` | legal_norms.id | PDF oficial de la ley / DS / decreto |
| `legal_norm_analysis` | legal_norm_analyses.id | Anexo o diagrama del análisis (opcional) |
| `plan_instrument` | plan_instruments.id | Export PDF del plan, anexos de control |
| `person` | persons.id | Foto carnet (uso restringido) |
| `staff` | staff.id | Credencial |
| `staff_requirement` | fila de requisito art. 12° | Certificados |
| `staff_certification` | fila de capacitación | Diploma curso |
| `contract` | contracts.id | Contrato, factura |
| `contract_incident` | incidencia ITS | Acta de incumplimiento |
| `procurement` | procurement.id | Especificación, bases |

MIME habituales: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`. Las grabaciones de televigilancia **no** entran aquí.

### Puerto de almacenamiento

`ObjectStoragePort` con dos implementaciones; el env elige **cuál** usa el `put` de altas. Clave sugerida:

```text
dsp/2027/{entity_type}/{entity_id}/{uuid}-{sanitized_filename}
```

Flujo: validar rol + clasificación → `put` con el driver del env → insertar fila con ese `storage_driver`. Si el `put` falla, no queda metadato huérfano. Variables: [05-envs.md](./05-envs.md).

## 6. Alertas (vínculo al modelo)

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | uuid | |
| `kind` | varchar | `milestone_due`, `milestone_overdue`, … |
| `title` / `body` | varchar / text | |
| `user_id` | uuid nullable | Sala personal |
| `role` | varchar nullable | Sala de rol |
| `project_id` | uuid nullable | |
| `task_id` | uuid nullable | |
| `read_at` | timestamptz nullable | |
| `created_at` | timestamptz | |

## 7. Módulos posteriores (no detalle completo aquí)

Siguen el mismo estilo de FK y multimedia:

| Módulo | Tablas núcleo | Enlace a cartera |
|--------|---------------|------------------|
| `territory` | `sectors` (polygon), visitas pueden ser `subtasks` de PRJ-14 | `project_id` / `task_id` |
| `assets` | cámaras, radios, EPP, puntos SUBDERE + Point | opcional a task |
| `contracts` | contrato, incidencias | `project_id` (p. ej. PRJ-13) |
| `procurement` | especificación / bases | `project_id` o `task_id` |
| `training` | cursos, completaciones | `staff_id` + multimedia |
| `diagnosis` | problemas Cap. 2 (fase posterior) | → O / projects |

## 8. Orden de migraciones

1. PostGIS + `persons` + `users` (con `persona_id`) + seed dirección.
2. `staff` (puede ir vacío al inicio).
3. `plan_instruments` (2027, misión) + `strategic_objectives` enriquecidos (O1–O4).
4. `legal_norms` + seed Cap. 1 + `legal_norm_analyses` + `legal_obligations` (+ N:M a O cuando existan).
5. `projects` + `project_strategic_objectives` + `obligation_projects` + seed cartera.
6. `tasks`, `subtasks`, `task_strategic_objectives`, `task_assignees`, `milestones`, `indicators`, `work_notes`.
7. `multimedia_assets` (incl. PDF de normas).
8. `notifications`, `notification_deliveries`, `notification_outbox` (ver [07-notificaciones](./07-notificaciones.md)).
9. Resto (territory, assets, contracts, procurement, training).

### Notificaciones (resumen)

Tres tablas en lugar de un `alerts` plano: hecho canónico, delivery por usuario, outbox de correo. Detalle de columnas y estados en [07-notificaciones.md](./07-notificaciones.md).

### Calendario de equipo (vista)

No introduce tablas nuevas en MVP. La agenda DSP se deriva de `tasks` (`starts_on`/`ends_on`) + `task_assignees` → `persons`. El overlay Outlook usa el email de la persona vía Graph app-only. Ver [08-calendario-equipo.md](./08-calendario-equipo.md).

## 9. Qué no modelar así

- Liquidación de remuneraciones.
- Multi-tenant / `company_id`.
- Imágenes del VMS / Central en `multimedia_assets`.
- Árbol de más de tres niveles (proyecto → tarea → subtarea).
- URLs de archivo fuera de `multimedia_assets`.
- Columna única `objective` en `projects` (usar N:M con `strategic_objectives`).
- Notas como campo texto único que se sobrescribe (usar `work_notes` cronológicas).
- Texto completo de la ley en una columna (PDF en multimedia + `summary` + `legal_norm_analyses`).
- El PDF Vivliostyle del libro como “base de datos” del plan.
- Paths absolutos o URLs públicas de R2 como fuente de verdad del archivo (usar `storage_key` + `storage_driver`).
- Dos destinos de alta simultáneos; el env elige uno. La fila recuerda dónde quedó cada archivo si el env cambia después.
- Email en `users` ni login por correo: el login es `username`; el email vive en `persons` (y opcionalmente `staff.work_email`).
