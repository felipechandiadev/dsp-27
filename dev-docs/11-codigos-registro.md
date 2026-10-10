# Códigos de registro

Folios internos generados por el backend al crear un registro. Formato fijo en español.

## Formato

```text
TTT + AA + NNNNNN
```

| Parte | Significado | Ejemplo |
|-------|-------------|---------|
| `TTT` | Tipo de registro (3 letras) | `PRY` |
| `AA` | Año (2 dígitos) | `26` → 2026 |
| `NNNNNN` | Correlativo anual | `000001` |

Ejemplo: **`PRY26000001`** — proyecto, año 2026, correlativo 1.

## Prefijos

| Prefijo | Entidad |
|---------|---------|
| `PRY` | Proyecto |
| `TAR` | Tarea (ejecución o cartera, según módulo) |
| `CTR` | Contrato |
| `PER` | Personal (`staff`) |
| `PSN` | Persona (si se asigna folio) |
| `AOP` | Área de operación |
| `INC` | Incidencia |
| `REQ` | Requerimiento |
| `OPE` | Operación de campo (despacho; no confundir con `AOP`) |
| `ITY` | Tipo de incidencia (catálogo) |

El **seed** y las **altas por API** usan el mismo formato. El seed asigna correlativos por prefijo/año y alinea `record_code_sequences` con `ensureAtLeast`, para que el siguiente `next()` no choque.

Las claves del libro de planificación (`PRJ-1`…`PRJ-16`, `TAR-1`…`TAR-3`) siguen siendo la referencia narrativa del plan; en BD el folio de `projects.code` es `PRY…` / `TAR…` (cartera `kind = portfolio_task` también usa prefijo `TAR`).

## Servicio

`RecordCodeService.next(prefix)`:

1. Año = calendario actual (`getFullYear()`).
2. Incrementa `record_code_sequences` (PK `prefix` + `year`) en transacción.
3. Devuelve el string formateado.

`ensureAtLeast(prefix, year, minValue)` — deja la secuencia ≥ `minValue` (seed).

Los handlers de create **no** aceptan `code` del cliente: siempre llaman al servicio.
