# Plan de desarrollo

Documento de arranque del repo. Congela **estructura de carpetas**, **librerías**, **cómo levantar** y el vínculo con la [guía paso a paso](./03-guia-paso-a-paso.md). No se inventa otra layout a mitad de camino.

Leer antes: [Generalidades](./01-generalidades.md) · [Arquitectura](./02-arquitectura-core.md) · [Modelo](./04-modelo-datos.md) · [Envs](./05-envs.md).

## 1. Principios de UI — mobile first (obligatorio)

La app se usa en escritorio **y** en terreno (gestores, prevención, visitas). Toda pantalla se diseña y se acepta primero en móvil.

| Regla | Detalle |
|-------|---------|
| Viewport de diseño | Partir de ~360–430px de ancho; luego tablet y desktop |
| No “desktop primero” | No se entrega una feature solo usable en monitor ancho |
| Shell | Nav colapsable / bottom o drawer en móvil; TopBar compacta |
| Listas y tablas | En móvil: cards o lista; DataGrid completo solo desde tablet si cabe |
| Formularios | Campos a ancho completo; teclado numérico donde aplique |
| Dialogs | En móvil: casi fullscreen o sheet; no modales estrechos ilegibles |
| CTAs | Alcanzables con el pulgar; primario visible sin scroll horizontal |
| Mapa / GPS | Flujo visita usable en una mano (ubicación → nota → foto) |
| DoD de UI | Probar en DevTools dispositivo móvil **antes** de marcar la feature lista |
| Design system | Solo `@felipechandiadev/ui` + shell en `app/src/shared` |

Roles de terreno (`gestor`, `prevencion`) priorizan flujos cortos. Dirección / análisis pueden tener vistas densas en desktop, pero las mismas rutas deben degradar bien en móvil.

## 2. Estructura de folders (comprometida)

```text
dsp-27/
├── README.md
├── package.json                      # workspaces: "core", "app"
├── .npmrc                            # GitHub Packages (@felipechandiadev)
├── .gitignore
├── envs/
│   ├── shared.env.example
│   ├── core.env.example
│   ├── app.env.local.example
│   └── sync-dev-envs.sh              # o scripts/env-dev
├── scripts/
│   ├── env-dev.sh
│   └── dev-all.sh                    # core + app en paralelo
├── dev-docs/                         # esta documentación
│   ├── README.md
│   ├── 01-generalidades.md
│   ├── 02-arquitectura-core.md
│   ├── 03-guia-paso-a-paso.md
│   ├── 04-modelo-datos.md
│   ├── 05-envs.md
│   └── 06-plan-desarrollo.md
├── core/                             # NestJS — API
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── nest-cli.json
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/
│   │   │   ├── config.schema.ts      # Joi
│   │   │   ├── config.service.ts
│   │   │   ├── typeorm.config.ts
│   │   │   └── data-source.ts        # CLI migraciones
│   │   ├── common/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   └── pipes/
│   │   ├── modules/
│   │   │   ├── health/
│   │   │   ├── auth/
│   │   │   ├── persons/
│   │   │   ├── users/
│   │   │   ├── staff/
│   │   │   ├── plan/
│   │   │   ├── legal/
│   │   │   ├── portfolio/            # projects, tasks, subtasks, notes, assignees
│   │   │   ├── integrations/
│   │   │   │   └── microsoft/        # OAuth Outlook + Graph mail/calendar
│   │   │   ├── notifications/        # inbox + WS + outbox email (doc 07)
│   │   │   ├── calendar/             # agenda equipo DSP + Outlook (doc 08)
│   │   │   ├── multimedia/
│   │   │   ├── training/             # fase posterior
│   │   │   ├── contracts/
│   │   │   ├── procurement/
│   │   │   ├── territory/
│   │   │   └── assets/
│   │   │       ├── presentation/
│   │   │       ├── application/      # commands, queries, handlers, ports
│   │   │       ├── domain/
│   │   │       ├── infrastructure/
│   │   │       ├── tests/
│   │   │       └── <nombre>.module.ts
│   │   └── migrations/
│   └── storage/
│       └── uploads/                  # gitignored; STORAGE_LOCAL_DIR
└── app/                              # Next.js — UI privada
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json
    ├── AGENTS.md                     # reglas Colección admin (kai-admin)
    ├── app/                          # App Router
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── login/
    │   └── (shell)/                  # rutas autenticadas
    │       ├── layout.tsx            # shell mobile-first
    │       ├── board/
    │       ├── plan/
    │       ├── legal/
    │       ├── projects/
    │       ├── alerts/
    │       └── …
    └── src/
        ├── features/
        │   └── {feature}/
        │       ├── actions/          # Server Actions
        │       ├── application/      # use cases
        │       ├── domain/           # Zod / tipos
        │       ├── infrastructure/   # *.request.ts → core
        │       └── ui/               # componentes de feature (mobile-first)
        ├── shared/                   # TopBar, Nav, Login, layout
        ├── providers/
        └── middleware.ts
```

Cada módulo Nest sigue capas Kai: presentation → application → domain → infrastructure.  
Cada feature Next: actions → usecase → `*.request.ts` (único lugar de `fetch` al core).

## 3. Librerías

Versiones alineadas al entorno Kai actual (Nest 11, Next 16, React 19). Ajustar minors al instalar.

### Root (`package.json` workspaces)

Scripts sugeridos: `core:dev`, `app:dev`, `env:dev`, `dev` (ambos), `migration:run`.

### `core/` — dependencias

| Uso | Paquete |
|-----|---------|
| Framework | `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `reflect-metadata`, `rxjs` |
| CQRS | `@nestjs/cqrs` |
| Config | `@nestjs/config`, `joi` |
| DB | `@nestjs/typeorm`, `typeorm`, `pg` |
| Auth | `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcryptjs` |
| Validación HTTP | `class-validator`, `class-transformer` |
| WebSocket | `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io` |
| API docs | `@nestjs/swagger` |
| Storage R2 | `@aws-sdk/client-s3` |
| Multipart | `@nestjs/platform-express` + `multer` (tipos `@types/multer`) |
| Util | `uuid` (si no se usa solo PK de TypeORM) |

**Dev:** `@nestjs/cli`, `typescript`, `ts-node`, `tsconfig-paths`, `tsc-alias`, `jest`, `@types/jest`, `@types/node`, `@types/bcryptjs`, `eslint`, prettier.

**No instalar al inicio:** Redis, sharp, fiscal, web-push, mysql, better-sqlite3.

### `app/` — dependencias

| Uso | Paquete |
|-----|---------|
| Framework | `next@16`, `react@19`, `react-dom@19` |
| Design system | `@felipechandiadev/ui` (GitHub Packages; `transpilePackages` en next.config) |
| Auth sesión | `next-auth` |
| Validación | `zod` |
| Tiempo real | `socket.io-client` |
| Iconos | según kai-ui / `lucide-react` si el DS lo permite |

**Dev:** TypeScript, ESLint `eslint-config-next`, tipos React.

Mapas (Leaflet) solo cuando entre territorio/GPS en UI; no bloquean el scaffold.

### PostGIS

No es un npm: extensión en Postgres (`CREATE EXTENSION postgis` en la primera migración). Imagen recomendada: `postgis/postgis` o Postgres del sistema + extensión.

## 4. Cómo levantar el proyecto (checklist)

### Prerrequisitos

- Node.js LTS (20+ recomendado)
- npm (workspaces)
- PostgreSQL 15+ con PostGIS
- Acceso a GitHub Packages para `@felipechandiadev/ui` (token en `.npmrc`)

### Primera vez

```bash
# 1. Clonar e instalar
cd dsp-27
npm install

# 2. Envs (ver 05-envs.md)
cp envs/shared.env.example envs/shared.env   # gitignored; secretos locales
npm run env:dev                              # → core/.env, app/.env.local

# 3. Base
createdb dsp27   # o equivalente
# Asegurar PostGIS disponible

# 4. Migraciones
npm run migration:run --workspace=core

# 5. Levantar
npm run core:dev    # http://localhost:5080
npm run app:dev     # http://localhost:5081
# o: npm run dev
```

Login seed: `username` = valor de `DSP_SEED_ADMIN_USERNAME` (p. ej. `direccion`).

### Puertos

| Servicio | Puerto |
|----------|--------|
| Core API + WS | 5080 |
| App Next | 5081 |

## 5. Orden de implementación (resumen)

Detalle y criterios “Listo cuando” en [03-guia-paso-a-paso.md](./03-guia-paso-a-paso.md). Vista de producto:

| Fase | Pasos guía | Entrega |
|------|------------|----------|
| A — Repo + core vacío | 0–2 | Folders, envs, Nest health |
| B — Identidad | 3–4 | persons, users (username), login JWT |
| C — Plan y normas | 5–6 | misión, O1–O4, legal_norms |
| D — Cartera | 7 | projects → tasks → subtasks |
| E — Multimedia + alertas | 8–9 | archivos local, notes, WS |
| F — Staff / ITS / territorio | 10–12 | según, contratos, GPS |
| G — App Next mobile-first | 13 | shell + pantallas; **probado en móvil** |
| H — R2 | 14 | cambiar `STORAGE_DRIVER` |

Desde el paso 13, **cada** pantalla nueva cumple la sección 1 (mobile first) antes del Done.

## 6. Definition of Done (global)

### Backend

- DTO + roles; migración si cambió el schema
- Handler con puerto falso en comandos de escritura
- Typecheck verde; sin TypeORM/S3 en controllers

### Frontend

- Flujo actions → usecase → `*.request.ts`
- Sin `fetch` al core desde cliente
- UI solo con `@felipechandiadev/ui` + shared
- **Viewport móvil verificado** (lista, ficha, form, dialog)
- Loading / empty / error usables con el pulgar

## 7. Referencias de código

| Qué copiar (hábito) | Dónde |
|---------------------|--------|
| Capas Nest + CQRS | `/Users/felipe/dev/kai/kai-core` |
| Envs matriz | `/Users/felipe/dev/kai/envs/` |
| Colección admin Next | `/Users/felipe/dev/kai/kai-admin/AGENTS.md` |
| Persona / staff / multimedia | `/Users/felipe/dev/civika/civika-core` |
| Design system | `@felipechandiadev/ui` (`kai-ui`) |
