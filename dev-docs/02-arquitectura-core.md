# Arquitectura del core

El core es un servicio NestJS. Su forma es **arquitectura hexagonal** (puertos y adaptadores) con **CQRS**. Es el mismo molde que `kai-core`: el dominio no conoce TypeORM, el disco ni Socket.IO; los adaptadores sí.

Referencia viva: `/Users/felipe/dev/kai/kai-core`. Un módulo representativo es `src/modules/products/` (comando, query, handler, puerto, repositorio). El tiempo real de referencia es `src/modules/notifications/` (`NotificationsGateway` + `NotificationsRealtimePublisher`).

El detalle de tablas está en [Modelo de datos](./04-modelo-datos.md).

## Piezas

```text
Cliente (Next 16, mobile first — ver 06-plan-desarrollo)
        │  HTTPS /api
        │  WSS  /realtime/alerts
        ▼
┌──────────────────────────────────────────────┐
│ core (NestJS, un proceso)                    │
│  presentation  controllers, DTO, gateway     │
│  application   commands, queries, handlers   │
│  domain        entidades, reglas, eventos    │
│  infrastructure TypeORM, storage local|R2    │
└──────────────────────────────────────────────┘
        │                      │
        ▼                      ▼
   PostgreSQL              Almacén de archivos
   + PostGIS               (un driver activo: local u R2)
```

Un solo proceso escucha HTTP y WebSocket. No hay un servicio de colas en la primera versión: el caso de uso persiste la alerta y el publisher la emite a la sala que corresponda.

## Capas de cada módulo

Igual que en Kai:

```text
modules/<nombre>/
  presentation/          # controllers, DTO de entrada, gateway si hay tiempo real
  application/
    commands/            # intención de cambio
    queries/             # intención de lectura
    handlers/            # CommandHandler / QueryHandler (@nestjs/cqrs)
    ports/               # interfaces: repositorio, storage, reloj, publisher
  domain/                # entidad, invariantes, eventos de dominio
  infrastructure/        # TypeORM, adaptador de disco, adaptador R2
  <nombre>.module.ts
  tests/
```

Reglas:

- El controller no habla con TypeORM. Arma un command o una query y lo entrega al `CommandBus` o al `QueryBus`.
- El handler depende del puerto (`PROJECTS_REPOSITORY`), no de la clase concreta.
- El módulo registra el puerto con `provide` / `useClass`, como `PRODUCTS_REPOSITORY` en Kai.
- `ValidationPipe` global: `whitelist`, `forbidNonWhitelisted`, `transform`.
- Filtro de excepciones global. Sin secretos en el código. Config validada al arrancar (Joi o equivalente), servicio tipado.
- `synchronize: false`. El esquema cambia solo por migraciones.
- Tests de handlers junto al módulo, con el puerto falso.

CQRS aquí significa separar lecturas y escrituras dentro del módulo. No implica event sourcing ni una base de lectura distinta.

## Postgres y PostGIS

Motor: **PostgreSQL** con la extensión **PostGIS**. La primera migración ejecuta `CREATE EXTENSION IF NOT EXISTS postgis`.

Las coordenadas se guardan en **WGS 84** (`geography`, SRID 4326). PostGIS calcula distancias en metros con `ST_Distance` sin reproyectar. Parral cae en UTM 19 Sur (EPSG:32719); esa proyección se usa solo si un informe lo pide, con `ST_Transform`, no como tipo de columna por defecto.

Columnas geográficas previstas:

| Dato | Tipo | Para qué |
|------|------|----------|
| Tarea / subtarea | `geography(Point, 4326)` nullable | Ejecución en terreno; GPS opcional |
| Punto de visita (subtarea PRJ-14) | `geography(Point, 4326)` | Puerta a puerta |
| Sector | `geography(Polygon, 4326)` o `MultiPolygon` | Cinco sectores de partida y los que se sumen |
| Cámara, LPR, punto SUBDERE | `geography(Point, 4326)` | Catastro art. 5°, PRJ-6, PRJ-9 |
| Medición de radio | `geography(Point, 4326)` + nivel | Los cinco sectores en cero de julio 2025, PRJ-11 |
| Edificio municipal | `geography(Point, 4326)` | PRJ-7 |

Índice: `GIST` sobre cada columna `geography`. Las consultas de “visitas de esta ronda dentro del sector” y “cámaras a menos de N metros” salen de PostGIS, no de filtros en la aplicación.

Identificadores: `uuid`. Fechas: `timestamptz`. Soft delete (`deleted_at`) en persona, staff, proyectos, tareas y multimedia; las alertas leídas no se borran, se marcan.

## Identidad (Persona / Usuario / Funcionario)

Tres entidades distintas. Detalle en el [modelo de datos](./04-modelo-datos.md).

| Entidad | Rol |
|----------|-----|
| `persons` | Identidad civil (RUT, nombre, **email**). Sin contraseña |
| `users` | Acceso: `persona_id` 1:1, **`username`** (login), password, rol |
| `staff` | Funcionario / personal afecto (calidad inspector, DS 97, unidad) |

Un usuario siempre es una persona. Un funcionario siempre es una persona. La persona puede no tener cuenta. Login: `POST /api/auth/login` con **username** + password (no email). Asignaciones: `person_id` / `staff_id`.

## Plan, normas y seguimiento

```text
plan_instruments (misión, visión?)
  └── strategic_objectives (O1–O4 fichas Cap. 3)
         │ N:M
legal_norms (+ PDF) → analyses → obligations ──┼──→ projects
                                               └──→ O
projects (PRJ-* / TAR-*)
  └── tasks              starts_on/ends_on · notes · multimedia · O?
        └── subtasks     starts_on/ends_on · notes · multimedia · GPS? · heredan O
```

- **Plan:** `plan_instruments` guarda misión (Cap. 3.1), visión opcional, criterios y resultados esperados.
- **O1–O4:** fichas enriquecidas (por qué, verificación, fuera de alcance) bajo el plan.
- **Normas:** catálogo Cap. 1 + PDF + análisis de la Dirección + obligaciones que anclan PRJ/O.
- **Proyecto / tarea / subtarea:** igual que antes; O obligatorio en la tarea si tiene subtareas.

Vinculaciones de personas: `task_assignees`. Notas: `work_notes`. Adjuntos: `multimedia_assets` (también `legal_norm`).

Avance: % derivado de hijos. Trazabilidad completa: norma → obligación → O → proyecto → tarea → subtarea (ver [modelo de datos](./04-modelo-datos.md) §2–3).

## Módulos

Se crean en el orden de la guía. Esta lista es el mapa completo para no rediseñar a mitad de camino.

| Módulo | Responsabilidad |
|--------|-----------------|
| `health` | `GET /api/health`, incluye que PostGIS responda |
| `auth` | Login, JWT, `GET /api/auth/me` |
| `persons` | Identidad civil (incl. email) |
| `users` | Cuentas (`username` = login) y roles |
| `staff` | Funcionarios, calidad, requisitos, nómina |
| `plan` | `plan_instruments` (misión/visión), O1–O4 enriquecidos |
| `legal` | Normas, análisis, obligaciones y vínculos a O/proyectos |
| `portfolio` | Proyectos, tareas, subtareas, N:M a O, notas, asignaciones, hitos, indicadores |
| `multimedia` | Imágenes y documentos (`entity_type` + `entity_id`), incl. PDF de leyes |
| `alerts` | Alerta persistida + gateway `/realtime/alerts` |
| `training` | Cursos, aprobación, plazos del art. 13° |
| `contracts` | Contratos e inspección ITS |
| `procurement` | Especificaciones y licitaciones |
| `territory` | Sectores; visitas como subtareas geolocalizadas |
| `assets` | Cámaras, radios, EPP, puntos (PostGIS) |

`portfolio` es el motor de seguimiento. `multimedia` es la única vía de archivos. Los módulos dueños (staff, territory, contracts) aportan el detalle de dominio; el árbol proyecto/tarea/subtarea aporta el avance.

## API REST

Prefijo global: `/api`. JSON. Autenticación: `Authorization: Bearer <jwt>`, salvo login y health.

Recursos de la primera API usable:

| Método y ruta | Uso |
|---------------|-----|
| `POST /api/auth/login` | `username` + contraseña → access token |
| `GET /api/auth/me` | Username, `personaId`, rol, datos de la persona (incl. email) |
| `GET /api/health` | Proceso y PostGIS |
| `GET /api/plan` | Instrumento activo: misión, visión, versión |
| `PATCH /api/plan` | Actualizar misión / visión / textos Cap. 3 |
| `GET /api/plan/objectives` | O1–O4 enriquecidos, proyectos/tareas, % agregado |
| `GET /api/legal/norms` | Catálogo del marco normativo |
| `GET /api/legal/norms/:id` | Norma + análisis publicados + obligaciones |
| `POST /api/legal/norms/:id/analyses` | Crear/actualizar análisis |
| `GET /api/legal/obligations` | Lista; filtro por norma, O o proyecto |
| `PUT /api/legal/obligations/:id/links` | Vincular O y/o proyectos |
| `GET /api/projects` | Lista filtrable por código, estado, objetivo estratégico |
| `POST /api/projects` | Alta de PRJ / TAR + vínculos a O |
| `GET /api/projects/:id` | Ficha + % avance + O + notas/adjuntos resumen |
| `PATCH /api/projects/:id` | Campos de la ficha y estado |
| `PUT /api/projects/:id/objectives` | Reemplazar set de O del proyecto |
| `GET /api/projects/:id/tasks` | Tareas del proyecto |
| `POST /api/projects/:id/tasks` | Tarea (fechas, objective_text, location opcional) |
| `PATCH /api/tasks/:id` | Estado, fechas, objective_text |
| `PUT /api/tasks/:id/objectives` | Vínculos a O (obligatorio si ya hay subtareas) |
| `GET /api/tasks/:id/subtasks` | Subtareas |
| `POST /api/tasks/:id/subtasks` | Subtarea; falla si la tarea no tiene O |
| `POST /api/tasks/:id/assignees` | Vincular persona/staff |
| `GET /api/notes` | Lista por `entityType` + `entityId` |
| `POST /api/notes` | Crear nota en project \| task \| subtask |
| `GET /api/multimedia` | Lista por `entityType` + `entityId` |
| `POST /api/multimedia` | Upload multipart (task/subtask siempre habilitado) |
| `GET /api/multimedia/:id/content` | Descarga según clasificación y rol |
| `GET /api/alerts` | Bandeja del usuario |
| `POST /api/alerts/:id/read` | Marca leída |

Módulos posteriores: `/api/persons`, `/api/staff`, `/api/contracts`, `/api/territory`, `/api/procurement`, `/api/assets`.

Errores: cuerpo `{ statusCode, message, error }`. 400 validación, 401 sin token o token inválido, 403 rol insuficiente, 404 inexistente.

## WebSockets de alertas

Namespace: `/realtime/alerts`. Misma app Nest, `@nestjs/websockets` y `@nestjs/platform-socket.io`, como en Kai.

```text
Caso de uso (handler)
  → persiste fila en alerts
  → AlertsRealtimePublisher.emit(payload)
       → sala user:{userId}     alerta personal
       → sala role:{rol}        alerta de la unidad
```

El gateway solo autentica y une salas. El publisher solo emite. El handler no importa `socket.io`. Ese corte es el de `NotificationsGateway` + `NotificationsRealtimePublisher` en Kai.

Autenticación del socket: el cliente envía el JWT en `handshake.auth.token`. El gateway verifica la firma y el usuario. No se acepta un `userId` enviado por el cliente como prueba de identidad.

Salas:

| Sala | Quién entra | Ejemplo |
|------|-------------|---------|
| `user:{id}` | Ese usuario | “Tu tarea PRJ-3 vence en 7 días” |
| `role:direccion` | Rol dirección | Nómina lista para instruir envío |
| `role:its` | Rol ITS | Incidencia de contrato |
| `role:administrativo` | Rol administrativo | Capacitación a 30 días del plazo |
| `role:prevencion` | Rol prevención | Ronda del trimestre sin cerrar |

Evento único de salida: `alert:created`, con `{ id, kind, title, body, projectId, taskId, createdAt }`. La bandeja histórica se lee por REST (`GET /api/alerts`).

Tipos de alerta de la primera versión: hito por vencer, hito vencido, multimedia requerida ausente, incidencia ITS, plazo de capacitación. El botón de pánico y el despacho de Central no entran en este canal.

## Puerto de archivos (multimedia)

Un solo puerto; **un driver activo** para las subidas nuevas (`STORAGE_DRIVER=local` **o** `r2`). No se opera “los dos a la vez” como destino habitual.

```text
ObjectStoragePort
  put(key, body, contentType) → { key, size, checksum }
  get(key) → stream
  delete(key)

LocalDiskStorage     # si STORAGE_DRIVER=local
R2Storage            # si STORAGE_DRIVER=r2 (S3-compatible)
```

### Modelo portable (sin conflicto al cambiar de almacén)

La tabla `multimedia_assets` **no** guarda rutas absolutas de disco ni URLs de R2 como verdad. Guarda:

| Campo | Rol |
|-------|-----|
| `storage_key` | Clave lógica estable (`dsp/2027/…/uuid-archivo.pdf`) |
| `storage_driver` | `local` \| `r2` — dónde está **este** archivo (congelado al subir) |

Flujo:

1. Alta: se usa el `STORAGE_DRIVER` del env → se escribe el binario → se guarda la fila con ese `storage_driver` + `storage_key`.
2. Lectura/borrado: se lee la fila → se elige el adaptador según `storage_driver` de la fila (como `storageProvider` en Kai).
3. Si mañana se cambia el env de `local` a `r2`: **las nuevas** subidas van a R2; el esquema no cambia. Las filas antiguas siguen leyéndose con su `storage_driver` hasta migrar binarios (script opcional que copia y actualiza la fila). No hay entidades `DocumentLocal` / `DocumentR2` ni columnas en conflicto.

También: `mime_type`, `kind`, `classification`, `entity_type`, `entity_id`. Clasificación: `interno`, `reservado`, `personal`.

Detalle de variables: [Variables de entorno](./05-envs.md).

## Configuración mínima

Ver lista completa en [05-envs.md](./05-envs.md). El arranque exige al menos:

```text
NODE_ENV, PORT, API_PREFIX
DB_*  (o DATABASE_URL)
JWT_SECRET, JWT_EXPIRES_IN
CORS_ORIGIN
STORAGE_DRIVER=local
STORAGE_LOCAL_DIR
```

Con `STORAGE_DRIVER=r2` hacen falta las `R2_*`. El path local puede seguir definido solo si aún hay filas `local` por migrar.

## Qué no entra al core de Kai

No se copia el catálogo de entidades de `typeorm.config.ts`, ni `companyId`, ni SQLite de la edición lite, ni Redis. DSP-27 tiene una base Postgres y una organización. Sí se toma el patrón de envs (matriz + Joi) y de `storageProvider` por asset.
