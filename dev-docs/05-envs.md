# Variables de entorno

Patrón inspirado en Kai (`/Users/felipe/dev/kai/envs/`): matriz + fragmentos + validación Joi al arranque. DSP-27 es más chico (core + una app): mismas ideas, menos variables.

## Estructura objetivo del repo

```text
dsp-27/envs/
  README.md                 # (opcional; este doc en dev-docs es la referencia)
  shared.env.example        # host, puertos, DB, JWT, storage
  core.env.example          # fragmento Nest
  app.env.local.example     # Next (cuando exista app/)
```

Script `npm run env:dev` (cuando exista): proyecta a `core/.env` y `app/.env.local`. Secretos reales solo en copias locales gitignored (`shared.env`, `.env.local`).

Referencia Kai: `envs/shared.env.example`, `envs/kai-core.env.example`, `config.schema.ts` (Joi).

## Regla de almacenamiento (local **o** R2)

| Qué | Dónde |
|-----|--------|
| Destino de **nuevas** subidas | `STORAGE_DRIVER=local` **o** `r2` (un valor) |
| Dónde está **este** archivo | Columna `multimedia_assets.storage_driver` |
| Clave del binario | `multimedia_assets.storage_key` (lógica, no path/URL) |

No es un sistema multimedia doble en paralelo. Es **uno u otro** según env, con entidad portable para que un cambio futuro de almacén no rompa tablas ni requiera entidades distintas. Detalle en [arquitectura](./02-arquitectura-core.md) y [modelo](./04-modelo-datos.md) §5.

Si se cambia el env de `local` a `r2`:

1. Las altas nuevas van a R2.
2. El esquema no cambia.
3. Las filas con `storage_driver=local` siguen leyéndose desde disco hasta migrar (script opcional).

## Core (`core/.env`)

### Aplicación

```text
NODE_ENV=development
PORT=5080
API_PREFIX=api
TIMEZONE=America/Santiago
LOG_LEVEL=info
ENABLE_SWAGGER=true
ENABLE_CORS=true
```

Puertos sugeridos (libres respecto a Kai 5050/506x): core **5080**, app **5081**.

### Base de datos (estilo Kai)

Preferir el set de Kai (Joi por campo). Alternativa aceptable: `DATABASE_URL` si el config lo parsea a lo mismo.

```text
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=dsp
DB_PASSWORD=
DB_DATABASE=dsp27
DB_SYNCHRONIZE=false
DB_LOGGING=false
DB_SSL=false
DB_MAX_CONNECTIONS=10
DB_CONNECTION_TIMEOUT=60000
```

PostGIS: extensión en la primera migración; no hace falta variable aparte si la imagen/servidor ya la trae.

### JWT

```text
JWT_SECRET=
JWT_EXPIRES_IN=24h
```

Refresh (`JWT_REFRESH_*`) opcional en MVP. No commitear secretos reales.

### CORS

```text
CORS_ORIGIN=http://localhost:5081
CORS_CREDENTIALS=true
ENABLE_CORS=true
```

En sync, `CORS_ORIGIN` puede derivarse del puerto de la app (como hace Kai con las PWA).

### Storage

```text
# Un solo destino de altas
STORAGE_DRIVER=local

# Disco (obligatorio si driver=local o si aún hay filas local)
STORAGE_LOCAL_DIR=./storage/uploads

# R2 (obligatorio si STORAGE_DRIVER=r2)
R2_ACCOUNT_ID=
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

MEDIA_MAX_FILE_SIZE=20971520
MEDIA_ALLOWED_MIME_TYPES=application/pdf,image/jpeg,image/png,image/webp
```

Nombres alineados a Kai (`STORAGE_STRATEGY` → aquí `STORAGE_DRIVER`; `LOCAL_STORAGE_PATH` → `STORAGE_LOCAL_DIR`; `R2_BUCKET_NAME`). Se puede aceptar alias `STORAGE_STRATEGY` / `LOCAL_STORAGE_PATH` en el schema Joi si se quiere copiar pegado desde Kai.

Validación sugerida: si `STORAGE_DRIVER=r2`, exigir las `R2_*` no vacías al arrancar.

### Seed (solo local, no en git)

```text
DSP_SEED_ADMIN_USERNAME=direccion
DSP_SEED_ADMIN_PASSWORD=
DSP_SEED_ADMIN_EMAIL=direccion@dsp.local
```

El seed crea `persons.email` = `DSP_SEED_ADMIN_EMAIL` (contacto) y `users.username` = `DSP_SEED_ADMIN_USERNAME` (login).
## App Next (`app/.env.local`) — cuando exista

```text
NEXT_PUBLIC_API_URL=http://localhost:5080
# Auth server-side (p. ej. next-auth), nunca en NEXT_PUBLIC_*
NEXTAUTH_URL=http://localhost:5081
NEXTAUTH_SECRET=
```

## Qué no traer de Kai

Redis, fiscal/SII, VAPID, kai-mail, gold API, `KAI_PRODUCT` / `KAI_DEPLOY_APPS`, edición lite/SQLite, multi-empresa.

## Checklist al crear `envs/`

- [ ] `shared.env.example` + `core.env.example` sin secretos reales
- [ ] Schema Joi en `core/src/config` falla si falta `JWT_SECRET` o DB
- [ ] `STORAGE_DRIVER` solo `local` \| `r2`
- [ ] Con `r2`, validar `R2_*`
- [ ] Documentar en README raíz: `npm run env:dev` / `core:dev`
