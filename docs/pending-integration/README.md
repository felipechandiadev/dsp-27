# Pending integration — DSP-27

Capacidades **aún no integradas** al producto DSP-27, necesarias para una digitalización integral de la Dirección de Seguridad Pública (DSP) de la Municipalidad de Parral.

Esta carpeta **no describe lo ya construido** (eso vive en [`dev-docs/`](../../dev-docs/)). Aquí se documenta el contraste entre el alcance actual y las exigencias de la **Ley N.º 21.802**, la Ley Orgánica Constitucional de Municipalidades (DFL 1) y diagnósticos nacionales de gestión local de seguridad (AMUCH, CESC — U. de Chile).

## Línea de base ya cubierta

El sistema cubre la operación y estrategia inicial:

- Seguimiento del Plan Comunal 2027 (proyectos, tareas y subtareas)
- Identidades y personal afecto (`staff`)
- Checklist de inspectores (Art. 12°)
- Inspección de contratos ITS
- Georreferenciación de áreas
- Triage de incidencias, requerimientos y despachos (OPE)

## Ejes de evolución (pendientes)

| # | Eje | Documento |
|---|-----|-----------|
| 1 | Interoperabilidad y gobernanza normativa (Ley 21.802) | [01-interoperability-governance.md](./01-interoperability-governance.md) |
| 2 | Coproducción de la seguridad y participación ciudadana | [02-citizen-coproduction.md](./02-citizen-coproduction.md) |
| 3 | Televigilancia inteligente y cadena de custodia | [03-video-surveillance-custody.md](./03-video-surveillance-custody.md) |
| 4 | Capacitaciones y relojes regulatorios | [04-training-regulatory-clocks.md](./04-training-regulatory-clocks.md) |
| 5 | Offline-first rural y analítica de impacto | [05-offline-impact-analytics.md](./05-offline-impact-analytics.md) |

## Preguntas abiertas de priorización

- Diseñar hoja de ruta por fases para incorporar estos módulos.
- Detallar el esquema técnico de integración Triage ↔ alertas ciudadanas (SOS / botón de pánico).
