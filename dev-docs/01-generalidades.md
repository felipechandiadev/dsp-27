# Generalidades

## Qué es DSP-27

DSP-27 es una aplicación privada de la Dirección de Seguridad Pública de la Municipalidad de Parral. Sirve para ejecutar y seguir el Plan de Seguridad Pública 2027 y, al mismo tiempo, para el trabajo continuo que la Ley N.º 21.802 exige a la Dirección: personal afecto, nómina de inspectores, capacitaciones, documentos, inspección de contratos, licitaciones, prevención y visitas.

El plan vive hoy como libro Vivliostyle. La app no reemplaza ese libro: lo vuelve operable. Cada proyecto (`PRJ-*`) y cada TAR del libro es un **proyecto** en el sistema, con **tareas** y **subtareas** para la ejecución, responsables, hitos, indicadores y multimedia. Las funciones permanentes (una visita, un acta de ITS, un certificado de curso, una factura) cierran tareas o subtareas de ese mismo árbol.

Hay una sola organización. No hay multi-tenant. No hay portal público.

## Dos planos, un motor

**Plan 2027.** Espejo vivo del libro: objetivos O1–O4, cartera, calendario, presupuesto como rubros (sin inventar montos) y obligaciones legales.

**Operación de la Dirección.** Trabajo que no termina cuando cierra un hito de obra: expedientes, capacitaciones, contratos, especificaciones, rondas territoriales, activos.

Los dos planos usan las mismas piezas: instrumento del plan (misión/visión), marco normativo (norma + análisis + obligación), objetivos O1–O4, proyecto → tarea → subtarea (fechas, notas, adjuntos), hito, indicador, multimedia, persona/staff y alerta. Detalle en [Modelo de datos](./04-modelo-datos.md).

## Secciones del producto

La numeración de cartera es la del libro: **PRJ-1 a PRJ-3 y PRJ-5 a PRJ-16** (no existe PRJ-4) y **TAR-1 a TAR-3**. Los markdown antiguos del folder de planificación usan otros códigos `P`; la app usa los del libro.

| Sección | Para qué | Ancla |
|---------|----------|--------|
| Tablero | O1–O4, cartera, hitos críticos, alertas abiertas | Resumen ejecutivo |
| Plan / Estrategia | Misión, visión (si existe), O1–O4, versión del instrumento | Capítulos 0 y 3 |
| Documentos | Hub: informes Word-in-browser (BetterOffice DOCX), normativa Cap. 1, tipos | Cap. 1 · archivo DSP |
| Diagnóstico | Capacidades: cámaras, radios, EPP, vehículos, contratos, bitácora | Capítulo 2 |
| Cartera | Ficha de cada PRJ y TAR | Capítulo 4 |
| Presupuesto | Rubro y brecha por ítem. El monto entra cuando SECPLAN lo entregue | Capítulo 5 |
| Calendario | Mes, responsable, indicador, riesgo | Capítulo 6 |
| Personal y nómina | Expediente, calidad de inspector/a, nómina trimestral | TAR-3, arts. 12°, 15° y 16° |
| Capacitaciones | Cursos, aprobación, reloj de 1 y 2 años | Arts. 13°, 49°–51° |
| Multimedia | Oficios, facturas, actas, especificaciones, folletos, fotos de terreno | Archivo de la Dirección |
| Tipos de documentos | Catálogo maestro (`/documents/types`): decreto, contrato, informe, acta… | Dentro del hub Documentos |
| ITS | Contratos vigentes: SLA, incidencias, actas, informes | Guardias, parquímetros, PRJ-13 |
| Licitaciones | Especificación técnica, bases, llamado, adjudicación, recepción | Ley 19.886; PRJ con compra |
| Prevención | Sectores, rondas puerta a puerta, instrumento, difusión | PRJ-14, PRJ-15, PRJ-16 |
| Rondas preventivas | Ficha PPV-01 en stepper (`/rondas-preventivas`) | Patrullaje preventivo vecinal |
| Triage | Incidencias, requerimientos y despachos de campo (`/triage`) | [13-flujo-operativo](./13-flujo-operativo.md) |
| Solicitudes | Ventanilla única (`/requests`) | Placeholder |
| Activos | Catastro de cámaras, radios, EPP, puntos SUBDERE | Arts. 5° y 19°, PRJ-11, PRJ-12 |
| Consejo y eventos | Sesiones, asistencia, acuerdos; planes de Vibra Fest y Tradiciones | PRJ-2, TAR-1, TAR-2 |
| Alertas | Plazos, incidencias y avisos en tiempo real | WebSocket |

Cada ficha de proyecto guarda el molde del libro: problema, objetivo al que aporta, conduce / comparte / recibe, alcance, tareas, entregables, hitos, interesados, riesgos, indicador de resultado, indicador de avance, hito legal y costo cuando exista cifra.

## Qué significa “nómina”

En esta app la nómina es el registro de inspectores e inspectoras que la municipalidad presenta a Carabineros y a la Subsecretaría (art. 15°). La liquidación de sueldos sigue en Recursos Humanos. La app guarda el expediente, arma el borrador de nómina y deja constancia del envío.

## Identidad (Persona / Usuario / Funcionario)

Tres entidades separadas:

| Entidad | Rol | Contacto / acceso |
|----------|-----|-------------------|
| **Persona** | Quién es (RUT, nombre) | Tiene **email** (contacto) |
| **Usuario** | Cuenta de la app | Solo **username** + password; el login usa el username |
| **Funcionario** (`staff`) | Personal afecto DSP | Apunta a persona; correo = el de la persona (o `work_email` si difiere) |

Todo usuario **es** una persona (`persona_id` obligatorio). Todo funcionario **es** una persona. Una persona puede existir sin cuenta y sin ser funcionario. Las asignaciones de tareas apuntan a persona o funcionario, no al username.

## Plan (misión / visión) y normas

El instrumento anual guarda la **misión** del Cap. 3.1 y, cuando exista, la **visión**. Los **O1–O4** son fichas (por qué, verificación, fuera de alcance), no solo un código.

La sección **Documentos** agrupa el archivo de la Dirección: **Redactar** (tipos `composed` con BetterOffice → DOCX en `multimedia_assets` + `managed_documents`), **Biblioteca**, **normativa** Cap. 1 (módulo legal: PDF oficial en `multimedia_assets` → `legal_norm`, análisis y obligaciones) y el catálogo de **tipos** (`creation_mode`). Detalle en [14-documentos.md](./14-documentos.md). La UI de adjuntos (`EntityAttachments`) se reutiliza en fichas con PDF; subida para tipos `attachment` queda como siguiente paso.

## Seguimiento, fechas, notas y objetivos

El avance se sigue en tres niveles: **proyecto → tarea → subtarea**.

En cada tarea y subtarea hay siempre: **fecha de inicio y de término**, **notas de trabajo** (hilo), **adjuntos** y un **objetivo operativo** (`objective_text`). Proyectos, tareas y subtareas pueden vincularse de forma independiente a uno o varios Objetivos Estratégicos (O), cada uno con su propia N:M (`project_strategic_objectives`, `task_strategic_objectives`, `subtask_strategic_objectives`).

Tareas y subtareas pueden llevar GPS. Las visitas puerta a puerta son subtareas geolocalizadas de PRJ-14.

## Multimedia

El archivo es uno: tabla `multimedia_assets` con vínculo polimórfico (`entity_type` + `entity_id`) para **imágenes y documentos** (PDF hasta 20 MB; imágenes hasta 8 MB). Catálogo de `entity_type` acotado en el servicio.

El destino de las **nuevas** subidas es **uno**: disco local **o** Cloudflare R2 (`STORAGE_DRIVER`). No se operan los dos como destino habitual a la vez. La fila guarda `storage_key` (clave lógica) y `storage_driver` (dónde quedó ese archivo), para que un cambio futuro de almacén **no cree conflicto en el esquema** ni tablas distintas. Lectura según la fila; migración de binarios opcional.

Cada archivo tiene clase de reserva (art. 22°): uso interno, reservado de seguridad, o datos de personal. Las imágenes de televigilancia no entran aquí. Variables: [05-envs.md](./05-envs.md).

## Roles de usuario (`users.role`)

Perfiles de **acceso a la app**, alineados a la orgánica objetivo (PRJ-1 / Astro seguridad-2027). No confundir con:

- **cargo / plaza** (Analista TIC, Gestor territorial…),
- **unidad** (`staff.unit`: `direccion` \| `analisis` \| `prevencion` \| `operaciones` \| `grd`),
- **perfil DS 97** (`fiscalizador` \| `coadyuvante` \| `no_operativo`).

Catálogo canónico en código: `core/src/modules/users/domain/user-roles.ts` (espejo UI: `app/src/shared/auth/user-roles.ts`).

| Rol | Cargo típico | Ve y hace |
|-----|--------------|-----------|
| `direccion` | Director/a | Tablero, instrucciones de envío, Consejo, calidad de inspector, lectura de ITS; administración de usuarios |
| `admin_sistema` | Administrador/a de sistema | Cuentas de acceso (`/settings/users`): alta, perfiles, estado y reset de contraseña |
| `analisis_datos` | Analista datos / control de gestión | Cartera, indicadores, Plan Comunal, nómina consolidada, encuesta |
| `analisis_sistemas` | Analista TIC / televigilancia | Activos, especificaciones, recepción de compras TIC y radios |
| `administrativo` | Administrativo/a personal y documentación | Expedientes, capacitaciones, credenciales, EPP, archivo |
| `its` | ITS | Contratos, niveles de servicio, actas, incumplimientos |
| `prevencion` | Liderazgo / coordinación preventivo | Sectores, rondas, programas, seguimiento de visitas |
| `gestor` | Gestor territorial | Bitácora, visitas GPS, instrumento, orientación inicial |
| `jefe_operaciones` | Jefe/a de Operaciones | Vista mando Central, bitácora operativa, personal de línea |
| `operador_televigilancia` | Operador/a de televigilancia | Alertas y bitácora de Central (sin editar plan ni contratos) |
| `inspector` | Inspector/a SM terreno | Tareas de terreno, notas, GPS, registros operativos |
| `jefe_grd` | Jefe/a GRD | Planes de emergencia, COGRID, mapas de riesgo |
| `grd` | Apoyo GRD | Ejecución y registro de emergencias / GRD |

La coordinación de unidad (Análisis, Prevención) es una **función** que la Dirección asigna a alguien de la unidad; no es un rol de planta ni un valor extra de `users.role`. Quien redacta una especificación no adjudica gasto. Quien inspecciona un contrato no lo modifica.

## UI — mobile first

La app se usa en escritorio y en terreno (gestores, prevención, visitas). **Toda pantalla se diseña y se acepta primero en móvil** (~360–430px), luego tablet y desktop.

- Shell: nav colapsable / bottom o drawer; TopBar compacta.
- Listas: cards o lista en móvil; DataGrid denso solo si cabe desde tablet.
- Formularios a ancho completo; dialogs casi fullscreen o sheet en móvil.
- Flujo visita (GPS → nota → foto) usable con una mano.
- Design system: solo `@felipechandiadev/ui` + shell en `app/src/shared`.
- DoD de UI: verificar en DevTools dispositivo móvil antes de marcar la feature lista.

Detalle de folders, librerías y bootstrap: [06-plan-desarrollo.md](./06-plan-desarrollo.md).

## Stack

| Capa | Elección |
|------|----------|
| API | NestJS 11, en `core/` |
| Datos | PostgreSQL + PostGIS, TypeORM, migraciones |
| Tiempo real | Socket.IO en el mismo proceso Nest (`/realtime/alerts`) |
| App | Next.js 16 en `app/`, una sola app privada, **mobile first** |
| UI | `@felipechandiadev/ui` |
| Archivos | Un driver activo (local **o** R2); misma entidad portable (`storage_key` + `storage_driver`) |
| Envs | Matriz estilo Kai (`envs/`); ver [05-envs.md](./05-envs.md) |

## Qué se toma de Kai, Civika y qué no

De `/Users/felipe/dev/kai/kai-core` se toma el esqueleto: configuración validada, `ValidationPipe` estricto, filtro de excepciones, migraciones, módulos en capas, CQRS con `@nestjs/cqrs`, y el par gateway + publisher de Socket.IO (el de notificaciones es el modelo de las alertas).

De Civika se toma el patrón de **Persona / User / Employee (Staff)** y la multimedia polimórfica (`entityType` + `entityId`). De Kai, el `storageProvider` por asset y el layout de envs.

No se clona el ERP de Kai ni el ecosistema completo de Civika: sin POS, fiscal, multi-empresa, Pulse/Nexo/Sentinel, ni VMS de televigilancia.

## Fuera de alcance de la primera construcción

- Portal ciudadano y web de difusión (PRJ-16 se registra; el sitio municipal no se construye aquí).
- Operación 24/7 de la Central (turnos, despacho, custodia de imágenes).
- Liquidación de remuneraciones.
- Montos de presupuesto inventados.
- Multi-municipalidad.

Esas piezas se agregan cuando el motor de cartera (proyecto → tarea → subtarea), multimedia y alertas ya esté estable. El orden está en la guía paso a paso.
