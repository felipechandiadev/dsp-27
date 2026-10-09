# Personal y nómina (staff)

Módulo de **personal afecto** a la Dirección de Seguridad Pública: expediente laboral, checklist art. 12°, calidad de inspector/a y borrador de nómina art. 15°. Inspirado en Civika (persona + employee) **sin** amarrar el funcionario a una cuenta de usuario.

MVP: checklist con estados + concesión explícita de calidad; ficha con tareas asignadas, actividad (notas/asignaciones) y avatar vía `multimedia_assets`. Capacitaciones completas quedan fuera.

## Triada

| Entidad | Rol |
|---------|-----|
| `persons` | Quién es (civil: nombre, RUT, email) |
| `users` | Cuenta de app (opcional; login = username) |
| `staff` | Vínculo laboral DSP (unidad, DS 97, calidad inspector) |

Un funcionario **siempre** es una persona. Puede existir **sin** usuario (expediente antes del login).

## Roles API

| Rol | Puede |
|-----|--------|
| `direccion` | Crear/editar staff, checks, conceder/revocar calidad |
| `administrativo` | Igual que dirección en este módulo |
| `jefe_operaciones` | Igual que dirección en este módulo |
| resto autenticado | Lectura de listado/ficha/nómina |

## Unidades (`staff.unit`)

`analisis` · `prevencion` · `operaciones` · `direccion` · `grd`

## Perfil DS 97 (`ds97_profile`)

`fiscalizador` · `coadyuvante` · `no_operativo` (nullable)

## Calidad inspector (`inspector_quality_status`)

| Estado | Significado |
|--------|-------------|
| `none` | Sin proceso de calidad |
| `pending` | Requisitos listos; pendiente de concesión |
| `granted` | En nómina art. 15° (si además `status=active`) |
| `revoked` | Calidad retirada |

La concesión a `granted` es **explícita** (no automática). Exige checklist en `received`/`approved`, salvo override de `direccion`.

## Checklist art. 12° (fijo)

Códigos en `staff_requirement_checks`:

- `idoneidad_moral`
- `salud_compatible`
- `antecedentes`
- `capacitacion_basica` (placeholder hasta módulo `training`)
- `declaracion_art16`

Estados por ítem: `missing` · `received` · `approved` · `rejected`.

## Nómina (art. 15°)

`GET /api/staff/payroll` = staff con `inspector_quality_status=granted` y `status=active`. No es liquidación de sueldos.

## API

- `GET /api/staff` — filtros `unit`, `status`, `inspectorQuality`, `ds97Profile`
- `GET /api/staff/payroll` — nómina
- `GET /api/staff/:code` — ficha + persona + checks
- `POST /api/staff` — crear (persona upsert + staff + checks); `code` generado (`PER` + año + correlativo, ver [11](./11-codigos-registro.md))
- `PATCH /api/staff/:code` — datos laborales / calidad
- `PATCH /api/staff/:code/requirements/:requirementCode` — estado de check
- `POST /api/staff/:code/avatar` — foto identidad (`entity_type=staff`, reemplaza imagen previa)
- Detalle incluye `tasks`, `activity`, `avatarAssetId`

## Ficha enriquecida

- **Tareas:** `task_assignees` por `staff_id` o `person_id` (link a proyecto).
- **Actividad:** notas (`work_notes.author_user_id`) + eventos de asignación.
- **Avatar:** `GET /api/multimedia/:id/content` (JWT).

## Fuera de alcance (MVP)

- Módulo `training` y plazos art. 13° automatizados
- Bitácora de cambios (`staff_change_log`)
- Sueldos, turnos, patrullas
