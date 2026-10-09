# Contratos e inspección ITS

Módulo de seguimiento de **servicios contratados con privados** (arriendos, guardias, aparcadero, etc.) bajo Inspección Técnica de Servicios (ITS). Alineado a Ley N.º 19.886 y a las funciones ITS del libro / Astro.

MVP: checklist y certificación **sin upload de archivos** (estados + nota). Multimedia se engancha después.

## Roles

| Rol | Puede |
|-----|--------|
| `its` | Abrir períodos, marcar docs, certificar |
| `direccion` | Crear contratos, lectura total, mismas acciones ITS |
| resto autenticado | Lectura de listado/ficha |

ITS **no adjudica ni modifica cláusulas** del contrato.

## Tipos (`contracts.kind`)

| kind | Uso |
|------|-----|
| `arriendo` | Arriendo de inmueble / equipo / servicio asociado |
| `guardias` | Vigilancia / seguridad privada |
| `aparcadero` | Servicio aparcadero (p. ej. PRJ-13) |
| `otro` | Mantención u otros |

## Contraparte

Tabla `contractors`: privado con `rut` (único) y `name` (razón social o nombre). Email/teléfono opcionales.

## Estados

**Contrato:** `draft` → `active` → `suspended` \| `closed`.

**Período mensual:** `open` → `docs_pending` → `ready_for_cert` → `certified` \| `overdue`.

**Documento del período:** `missing` \| `received` \| `approved` \| `rejected`.

## Checklist fijo por `kind`

| kind | doc_types |
|------|-----------|
| `arriendo` | `factura`, `informe_servicio`, `acta_visita` |
| `guardias` | `asistencia`, `factura`, `informe_servicio`, `acta_visita` |
| `aparcadero`, `otro` | `factura`, `informe_servicio`, `acta_visita` |

## Proceso mensual

1. Se abre un `contract_period` (año/mes) para el contrato `active`.
2. ITS marca cada ítem del checklist (`received` / `approved` / `rejected`).
3. Cuando todos están `received` o `approved`, el período queda listo para certificar.
4. ITS ejecuta **certificar** → `status = certified`, `certified_at`, nota opcional.
5. Atraso (`overdue`) y notificaciones: reservado (`contracts.period_overdue`).

## API

Prefijo `/api/contracts` (JWT). Ver handlers Nest en `core/src/modules/contracts`.

Al crear un contrato, el `code` lo asigna el backend (`CTR` + año + correlativo; ver [11-codigos-registro.md](./11-codigos-registro.md)).

## UI

- `/contracts` — listado (DataGrid / cards)
- `/contracts/[code]` — ficha + períodos
- `/contracts/[code]/periods/[ym]` — checklist + certificar (`ym` = `YYYY-MM`)
