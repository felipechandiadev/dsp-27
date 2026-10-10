# Documentación de desarrollo — DSP-27

Esta carpeta es la guía para construir la app. Se escribe antes del código. El código de `core/` y `app/` se arma siguiendo estos documentos, en el orden de la guía paso a paso.

La app es el sistema de trabajo de la Dirección de Seguridad Pública de Parral para el Plan 2027: estrategia (misión/visión/O), marco normativo, cartera, tareas, documentos, contratos, prevención y alertas. El libro Vivliostyle en `/Users/felipe/Desktop/contratos/seguridad-2027/dev-docs/` es el contenido del plan. Esta carpeta es cómo se construye el software.

## Lectura

1. [Generalidades](./01-generalidades.md) — qué es el producto, secciones, identidad, multimedia y **UI mobile first**.
2. [Arquitectura del core](./02-arquitectura-core.md) — hexagonal con CQRS, el mismo molde que `kai-core`: Postgres, PostGIS, API REST y websockets.
3. [Guía paso a paso](./03-guia-paso-a-paso.md) — orden de implementación. No se salta un paso.
4. [Modelo de datos](./04-modelo-datos.md) — Persona / Usuario (login=username) / Funcionario, plan, normas, cartera, multimedia portable.
5. [Variables de entorno](./05-envs.md) — matriz estilo Kai; `STORAGE_DRIVER` local **o** R2; entidad sin conflicto al cambiar almacén.
6. [Plan de desarrollo](./06-plan-desarrollo.md) — folders congelados, librerías, bootstrap, DoD mobile first.
7. [Notificaciones](./07-notificaciones.md) — hecho canónico + deliveries + WS + outbox email (asignación de tarea).
8. [Calendario de equipo](./08-calendario-equipo.md) — capa DSP (tareas) + overlay Outlook app-only.
9. [Contratos / ITS](./09-contratos-its.md) — privados, períodos mensuales, checklist y certificación.
10. [Personal / staff](./10-personal-staff.md) — expediente, checklist art. 12°, calidad inspector y nómina art. 15°.
11. [Códigos de registro](./11-codigos-registro.md) — folio `TTT` + año + correlativo (p. ej. `PRY26000001`).
12. [Áreas de operación](./12-areas-operacion.md) — tipos administrables + polígonos PostGIS / Leaflet.
13. [Flujo operativo](./13-flujo-operativo.md) — incidencias, requerimientos, operaciones (bandeja).

Fuente de contenido del plan: `/Users/felipe/Desktop/contratos/seguridad-2027/` (libro Vivliostyle Cap. 1 y 3).

## Fuentes

| Qué | Dónde |
|-----|--------|
| Plan 2027 (PRJ / TAR, objetivos, calendario) | `/Users/felipe/Desktop/contratos/seguridad-2027/dev-docs/book/` |
| Cargos y funciones Ley 21.802 | `/Users/felipe/Desktop/contratos/seguridad-2027/funciones-cargos-dsp-ley-21802.md` |
| Requisitos de inspectores y capacitación | `/Users/felipe/Desktop/contratos/seguridad-2027/requisitos-contratacion-inspectores-ley-21802.md` |
| Esqueleto Nest + envs | `/Users/felipe/dev/kai/kai-core`, `/Users/felipe/dev/kai/envs/` |
| Persona / User / Employee y multimedia | `/Users/felipe/dev/civika/civika-core` (identity, multimedia); `docs/Entidades Postgres - Vórtice.md` |
| Reglas de pantallas (cuando exista `app/`) | `/Users/felipe/dev/kai/kai-admin/AGENTS.md` |
| Design system | `@felipechandiadev/ui` (`kai-ui`) |

`GUIA-DESARROLLO.md` en la raíz del repo es el borrador anterior. Esta carpeta lo reemplaza.
