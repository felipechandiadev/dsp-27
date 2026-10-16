# Documentos — hub, Word-in-browser y catálogos

Gestión documental de la Dirección: un hub en la app agrupa **Redactar**, **Biblioteca**, **Normativa** y **Tipos de documento**.

## Navegación

| Ruta | Contenido |
|------|-----------|
| `/documents` | Hub (Redactar · Biblioteca · Normativa · Tipos) |
| `/documents/compose` | Redactar: tipos `composed` + BetterOffice (DOCX) → API |
| `/documents/library` | Biblioteca: listado de `managed_documents` |
| `/documents/reports/:code` | Detalle + editor Word (BetterOffice) |
| `/documents/norms` | Catálogo normativo (módulo legal) |
| `/documents/norms/:code` | Ficha de norma + PDF |
| `/documents/types` | Admin de `document_types` (incluye `creationMode`) |

Redirects: `/documents/reports` → `/documents/library`, `/legal` → `/documents/norms`, `/document-types` → `/documents/types`.

Menú lateral: un solo ítem **Documentos** (`/documents`).

## Modo de creación (`document_types.creation_mode`)

| Valor | UI | Uso |
|-------|-----|-----|
| `composed` | Redactar (BetterOffice DOCX) | Informe, memo, acta, asistencia, … |
| `attachment` | (siguiente paso: subida de archivo) | Factura, decreto, contrato, resolución |

## Modelo: `managed_documents`

Cuerpo canónico = **archivo `.docx`** en `multimedia_assets` (`body_asset_id`).

| Columna | Notas |
|--------|--------|
| `code` | Folio `DOC` + año + correlativo |
| `title` | Título |
| `document_type_id` | FK opcional → `document_types` |
| `status` | `draft` \| `published` |
| `body_asset_id` | UUID del asset DOCX (`entity_type=managed_document`, `classification=body_docx`) |
| `body_json` / `body_html` | Legacy (ya no usados en UI composed) |
| `created_by_user_id` | Autor |
| soft delete | `deleted_at` |

## API

Prefijo JWT: `/api/documents/reports`

| Método | Ruta | Notas |
|--------|------|--------|
| GET | `/api/documents/reports` | `?status=` opcional |
| GET | `/api/documents/reports/:code` | Incluye `bodyAssetId` |
| POST | `/api/documents/reports` | Crea con folio `DOC` |
| PATCH | `/api/documents/reports/:code` | Metadatos (+ `bodyAssetId`) |
| PUT | `/api/documents/reports/:code/body` | Multipart `.docx` → multimedia + `body_asset_id` |

Contenido del DOCX: `GET /api/multimedia/:id/content` (JWT). Usado para cargar el editor y para **Descargar .docx**.

Escritura: roles `direccion`, `administrativo`, `prevencion`.

## UI / BetterOffice

- Dependencias: `@betteroffice/docx-react`, `@betteroffice/docx` (Apache-2.0).
- `DocxDocumentEditor` en `app/src/features/documents/ui/` (páginas, toolbar Word, zoom, regla, abrir archivo).
- Guardar unificado: botón de página → `editorRef.save()` → `PUT .../body` (+ PATCH metadatos en detalle). Estado sucio vía `onDirtyChange` + `beforeunload`.
- Fuentes de medición: `@betteroffice/fonts` + `configureDefaultFonts` (Carlito↔Calibri, Liberation↔Arial/Times, …). Los TTF se copian a `public/betteroffice-fonts/` con `npm run sync:fonts` (predev/prebuild).
- Fuentes UI (picker): Source Sans 3 + Source Serif 4 (woff2) en `app/public/fonts/`, pasadas a `DocxEditor` vía prop `fonts`.

### Plantillas (`app/public/templates/`)

| Archivo | Uso |
|---------|-----|
| `blank.docx` | Por defecto |
| `memo.docx` | Título «MEMORANDO» + cuerpo A4 |
| `informe.docx` | Título «INFORME» + Antecedentes / Desarrollo / Conclusiones |

Mapa por `documentTypeCode` (`docx-templates.ts`): `memo` → memo; `informe` / `informe_servicio` → informe; resto → blank. En Redactar, al cambiar el tipo se recarga la plantilla solo si el documento no está sucio (si lo está, se pide confirmación).

### Importar y descargar

- **Redactar:** Importar `.docx` local (`showFileOpen` / abrir archivo) antes de crear el registro.
- **Detalle:** botón «Descargar .docx» → `GET /api/multimedia/:bodyAssetId/content` como `{code}.docx`. Si no hay asset, exporta desde el editor y luego descarga.

## Fuera de alcance (MVP)

- Subida de adjuntos para tipos `attachment`.
- Colaboración en tiempo real BetterOffice.
- Retirada definitiva de columnas TipTap legacy en BD.
