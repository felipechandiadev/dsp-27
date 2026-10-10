# Áreas de operación

Divisiones geográficas donde la DSP interviene. Cada área es un **polígono** (PostGIS `geography(Polygon, 4326)`). Los **tipos** (territorio, sector, barrio, …) son un catálogo administrable, no un enum fijo en código.

Referencia de mapa: Leaflet + leaflet-draw (mismo enfoque que zonas de entrega en bshop).

## Modelo

### `operation_area_types`

| Campo | Notas |
|-------|--------|
| `code` | slug único (`sector`, `barrio`, …) |
| `name` | etiqueta UI |
| `color` | hex opcional para el mapa |
| `sort_order` | orden en listas |
| `status` | `active` \| `inactive` |

### `operation_areas`

| Campo | Notas |
|-------|--------|
| `code` | folio `AOP` + AA + NNNNNN ([11-codigos-registro](./11-codigos-registro.md)) |
| `type_id` | FK → tipos |
| `parent_id` | self FK opcional (barrio ⊂ sector) |
| `geom` | `geography(Polygon, 4326)` — índice GIST |
| `status` | `active` \| `inactive` |

La API intercambia `geometry` como GeoJSON Polygon. TypeORM no mapea `geom`; lectura/escritura vía `OperationAreaGeometryService` (`ST_AsGeoJSON` / `ST_GeomFromGeoJSON`).

Validación: tipo `Polygon`, anillo cerrado, ≥ 4 puntos.

## API (`/api/territory`)

Auth JWT en todos los endpoints.

**Tipos**

- `GET /area-types?status=`
- `POST /area-types`
- `PATCH /area-types/:id`

**Áreas**

- `GET /areas?typeId=&status=` — incluye `geometry` y tipo resumido
- `GET /areas/:code`
- `POST /areas` — `name`, `typeId`, `parentId?`, `geometry`, `notes?`
- `PATCH /areas/:code` — metadatos y/o `geometry`

Escritura: roles `direccion` \| `prevencion` \| `administrativo`.

## UI

Ruta `/areas` con `TabPageLayout` + `Tabs`:

- `?tab=areas` (default) — lista + mapa Leaflet (dibujar/editar polígono) + panel de edición
- `?tab=types` — CRUD de tipos

Nav: **Áreas de operación** (`MapPinned`). `/prevention` redirige a `/areas`.

Mapa centrado en Parral; tiles OSM.

## Seed

Tipos: `territorio`, `sector`, `barrio`.  
Cinco sectores aproximados PRJ-14: Plaza de Armas, Catillo, Villa San Pedro, Palma Rosa, Terminal de Buses.

## Fuera de este MVP

Visitas GPS → `ST_Covers`, capas comunales oficiales, asignación de gestores por área, MultiPolygon.
