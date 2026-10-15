# Flujo operativo (Bandeja)

Spine operativo DSP alineado a Nexo: **Incidencia** (hecho) → **Requerimiento** (solicitud) → **Operación** (`field_operations`, despacho).

Referencia conceptual: Civika `FLUJO-OPERATIVO.md`. En DSP la UI de triage está en `/triage`. Las solicitudes de ventanilla son otra sección: `/requests` (menú **Solicitudes**).

## Modelo

| Entidad | Folio | Tabla |
|---------|-------|-------|
| Incidencia | `INC`+AA+NNNNNN | `incidencias` |
| Requerimiento | `REQ`… | `requerimientos` |
| Operación (despacho) | `OPE`… | `field_operations` |

Catálogos seed: `incident_types`, `operation_types`.

- Verificación de incidencia (`sin_verificar` \| `verificada` \| `descartada`) **no bloquea** despacho.
- Requerimientos abiertos: `ingresado` \| `en_gestion`.
- Ops activas MVP: `asignada` \| `en_traslado` \| `ejecutando`.
- `area_id` opcional → `operation_areas` (no confundir con folio `AOP`).
- Ubicación dibujada del caso: `location_geom` (`geography`, GIST) en `incidencias`, `requerimientos` y `field_operations`. API: `locationGeometry` GeoJSON `Point` \| `LineString` \| `Polygon`. En Inc/Req, si es `Point` se sincronizan `lat`/`lng`.

## API `/api/operational-cases`

JWT en todos los endpoints.

- `GET /incident-types`, `POST /incident-types` (alta desde Triage; folio `ITY` automático), `GET /operation-types`
- Incidencias: `GET/POST /incidencias`, `GET /:code`, `PATCH /:code` (campos + `locationGeometry`), `PATCH /:code/verification`
- Requerimientos: `GET/POST /requerimientos?open=`, `GET /:code`, `PATCH /:code` (campos + `locationGeometry`), `PATCH /:code/status`, `PATCH /:code/close`
- Operaciones: `GET/POST /operations?active=`, `GET /:code`, `PATCH /:code` (briefing/prioridad/`locationGeometry`), `PATCH /:code/status`

## UI

Nav **Triage** → `/triage`: tres columnas (Incidencias \| Requerimientos \| Operaciones), cards estilo Nexo (folio + badges + chevron), edición inline al expandir, líneas de trazabilidad entre cards vinculadas al seleccionar (desktop), dialogs de alta/despacho/cierre. Móvil: tabs por columna. Legacy: `/bandeja` → `/triage`.

Ubicación en mapa (Leaflet): switch **Punto · Línea · Área** en create/edit de las tres entidades; capa de contexto con áreas de operación (solo lectura).

Nav **Solicitudes** → `/requests` (ventanilla; placeholder). Legacy: `/solicitudes` → `/requests`.

## Fuera de este MVP

SOS, Pulse, Gemelo, multimedia, notificaciones, mapa global de incidencias, `ST_Covers` / auto-`area_id`, reporte inmutable, catálogo admin, derivación con destinos.
