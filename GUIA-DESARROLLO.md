# Guía de desarrollo — DSP-27

> Borrador anterior. La guía vigente está en [`dev-docs/`](./dev-docs/README.md): generalidades, arquitectura, paso a paso, modelo, envs y [plan de desarrollo](./dev-docs/06-plan-desarrollo.md) (folders, libs, mobile first).

App **privada** **DSP-27** para gestionar documentación, avance, cambios y seguimiento del **Plan de Seguridad Pública 2027** (Dirección de Seguridad Pública).  
Stack: **Next.js** (una sola app) + **NestJS core** + design system **`@felipechandiadev/ui`** (kai-ui).

---

## 1. Alcance del producto

| Incluye | No incluye |
|---------|------------|
| Una app Next privada (tipo backoffice) | Portal público |
| Core Nest separado | Fork local del design system |
| Proyectos del plan, documentos, avance, cambios, usuarios | Clonar el ERP completo de kai |
| UI desde kai-ui publicado | `@realestate/ui` ni copias en `packages/ui` |

### Dominio MVP

1. **Proyectos / iniciativas** — ligados al Plan Seguridad 2027 (objetivos, estado, fechas, responsables)  
2. **Documentación** — MD / archivos / links (contratos, fichas, actas, normativa de apoyo)  
3. **Avance** — hitos, checklist o % de progreso  
4. **Cambios** — changelog (qué, por qué, cuándo, quién)  
5. **Usuarios y roles** — admin / editor / viewer  

---

## 2. Referencias canónicas

| Pieza | Fuente | Qué tomar |
|-------|--------|-----------|
| Core Nest | `/Users/felipe/dev/kai/kai-core` | Esqueleto: `config/`, `common/`, `main.ts`, capas de módulo, migraciones, ValidationPipe estricto |
| Reglas Next | `/Users/felipe/dev/kai/kai-admin/AGENTS.md` | Patrón **Colección admin**, Server Actions → use cases → `*.request.ts` |
| Design system | `/Users/felipe/dev/kai-ui` → `@felipechandiadev/ui` | Primitivos, layouts, DataGrid, CollectionGrid, Dialog, Toast |
| Forma monorepo (inspiración) | `/Users/felipe/dev/realEstatePlatform-3` | App + `core/` separado, `envs/` — **sin** portal |
| Contenido de negocio (docs) | `/Users/felipe/Desktop/contratos/seguridad-2027/` | Planificación, funciones, objetivos — como insumos, no como código |

**No** usar realEstate `core` como plantilla principal.  
Sí se puede tomar el patrón de use-cases hexagonales limpios dentro de un módulo estilo kai.

---

## 3. Estructura objetivo del repo

```text
dsp-27/
├── GUIA-DESARROLLO.md          # este documento
├── README.md                   # overview + cómo levantar
├── package.json                # workspaces (app + packages opcionales)
├── envs/                       # matriz .env + sync
├── scripts/                    # dev-all, etc.
├── app/                        # Next.js — UI privada
│   ├── app/                    # App Router
│   ├── src/
│   │   ├── features/           # por dominio
│   │   ├── shared/             # shell, TopBar, login (app-local)
│   │   ├── providers/
│   │   └── middleware.ts
│   ├── AGENTS.md               # reglas para agentes (adaptar de kai-admin)
│   └── package.json
└── core/                       # NestJS — API (standalone)
    ├── src/
    │   ├── main.ts
    │   ├── app.module.ts
    │   ├── config/
    │   ├── common/             # filters, pipes, guards
    │   ├── modules/
    │   │   ├── auth/
    │   │   ├── users/
    │   │   ├── projects/
    │   │   ├── documents/
    │   │   ├── milestones/
    │   │   └── changes/
    │   └── migrations/
    └── package.json
```

- Frontend: carpeta `app/` (como `kai-admin` / `backoffice`).  
- Backend: carpeta `core/` con **calidad de esqueleto** de `kai-core`.

---

## 4. Arquitectura del core (Nest)

### 4.1 Principios (desde kai-core)

- Nest 11 + TypeORM + PostgreSQL (preferido).  
- Config validada (Joi o equivalente) + servicio tipado — sin secretos hardcodeados.  
- `ValidationPipe` global: `whitelist`, `forbidNonWhitelisted`, `transform`.  
- Exception filter global + logging estructurado.  
- Migraciones versionadas; **no** `synchronize: true` en entornos serios.  
- Módulos con capas:

```text
modules/<nombre>/
  presentation/     # controllers, DTOs
  application/      # use cases
  domain/           # entidades, puertos
  infrastructure/   # TypeORM, adapters
  tests/
```

### 4.2 Auth (MVP)

- JWT Bearer + roles (`admin` | `editor` | `viewer`).  
- Multi-tenant: **no** en MVP (app de una municipalidad / una organización).  
- Guards en controllers; sin logs de debug a `/tmp`.

### 4.3 Qué no traer de kai-core

Fiscal, POS, inventario, HCM, websockets de cocina, etc. Solo el **esqueleto** y hábitos de calidad.

### 4.4 APIs del MVP (borrador)

| Recurso | Operaciones |
|---------|-------------|
| `/api/auth/*` | login, me, logout |
| `/api/projects` | CRUD + list/filter (iniciativas del plan) |
| `/api/projects/:id/documents` | CRUD / upload o link |
| `/api/projects/:id/milestones` | CRUD + avance |
| `/api/projects/:id/changes` | list + create changelog |
| `/api/users` | admin: list/invite/roles |

---

## 5. Arquitectura Next (reglas obligatorias)

Fuente: patrón **Colección admin** de `kai-admin/AGENTS.md`.

### 5.1 Flujo de datos

```text
UI (RSC / client)
  → Server Actions (`src/features/{feature}/actions/*.action.ts`)
  → use cases (`application/*.usecase.ts`)
  → validación (Zod en `domain/`)
  → infrastructure (`*.request.ts` — ÚNICO lugar de fetch al core)
  → Nest API
```

**Prohibido:** `fetch` al backend desde componentes cliente, hooks de UI o `page.tsx` sueltos.

### 5.2 Feature layout

```text
src/features/projects/
  actions/
  application/
  domain/
  infrastructure/
  types/
```

### 5.3 Pantallas de colección

- `CollectionPageLayout` + CTA «Crear …»  
- Cards / `CollectionGrid` o `DataGrid` según el caso  
- Diálogos: solo `Dialog` de `@felipechandiadev/ui`  
- Títulos: **«Crear …»** / **«Actualizar …»**  
- Loading: `DotProgress`  
- Feedback: `Alert` / `Toast`  

### 5.4 UI

- Primitivos **solo** desde `@felipechandiadev/ui`.  
- Shell (TopBar, login, menú) en `src/shared/` de la app.  
- Tokens según README de kai-ui + `transpilePackages: ["@felipechandiadev/ui"]`.  
- Registry: GitHub Packages (`@felipechandiadev` en `.npmrc`).

### 5.5 Auth Next

- `next-auth` (o esquema alineado a kai-admin).  
- Sesión de app privada; Bearer al core solo desde `*.request.ts` en servidor.

---

## 6. Plan de implementación por fases

### Fase 0 — Repo base

- [ ] Inicializar git en `dsp-27`  
- [ ] `README.md` + esta guía  
- [ ] `envs/` con plantillas `.env.example`  
- [ ] `.npmrc` para GitHub Packages  

### Fase 1 — Core mínimo

- [ ] Scaffold Nest (`core/`) con config validada, filter, ValidationPipe  
- [ ] Módulo `auth` + `users`  
- [ ] Primera migración PostgreSQL  
- [ ] Health check  

### Fase 2 — App Next mínima

- [ ] Scaffold Next 16 + React 19  
- [ ] Instalar `@felipechandiadev/ui`  
- [ ] Login + layout shell  
- [ ] `AGENTS.md` adaptado de kai-admin  
- [ ] Feature ejemplo con capas correctas  

### Fase 3 — Dominio proyectos del plan

- [ ] Core: módulo `projects`  
- [ ] App: colección + crear/actualizar/eliminar (Colección admin)  

### Fase 4 — Documentos, avance, cambios

- [ ] Módulos Nest + features Next  
- [ ] Detalle con `Tabs` (Overview / Docs / Avance / Cambios)  

### Fase 5 — Endurecer

- [ ] Roles en guards y UI  
- [ ] Tests de use cases críticos  
- [ ] E2E de humo (login + listar proyectos)  
- [ ] CI: typecheck/test/build app + core  

---

## 7. Convención de trabajo diario

1. Cambios de **dominio/API** → `core/` primero (migración si aplica).  
2. Cambios de **pantalla** → feature en `app/src/features/…`.  
3. Cambios de **design system** → PR en `kai-ui`, publicar, bump en `app`.  
4. No copiar componentes de kai-ui al repo.  
5. No mezclar lógica de negocio en componentes cliente.

### Comandos objetivo (cuando existan)

```bash
npm run core:dev
npm run app:dev
npm run env:dev
npm run migration:run --prefix core
```

---

## 8. Definition of Done

- [ ] Endpoint(s) en core con DTO validado y roles  
- [ ] Migración si hubo cambio de schema  
- [ ] Feature Next: `actions` → `usecase` → `request`  
- [ ] Sin `fetch` en cliente hacia el API  
- [ ] UI con `@felipechandiadev/ui`  
- [ ] Colección/detalle usable (loading, errores, empty state)  
- [ ] Typecheck/lint OK  

---

## 9. Decisiones abiertas

| Tema | Default sugerido |
|------|------------------|
| Nombre del repo / package | `dsp-27` |
| Auth | next-auth + JWT en core |
| Docs | Links + MD en DB (MVP) |
| Changelog | Manual en MVP |
| Multi-tenant | No en MVP |

---

## 10. Checklist de arranque

1. [ ] Crear `core/` desde esqueleto kai-core (sin dominio ERP)  
2. [ ] Crear `app/` con reglas kai-admin + `@felipechandiadev/ui`  
3. [ ] Auth + primer CRUD `projects`  
4. [ ] Tabs de detalle: docs / avance / cambios  
5. [ ] Roles + CI  

---

*Documento vivo — DSP-27 (Plan de Seguridad Pública 2027).*
