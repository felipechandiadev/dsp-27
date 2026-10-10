/**
 * Idempotent development seed for DSP-27.
 * Usage: npm run seed (from root or core workspace)
 *
 * Folios de registro (`persons`, `projects`, `tasks`, `contracts`, `staff`)
 * usan el mismo formato que la API: TTT + AA + NNNNNN (ver RecordCodeService).
 * Las claves del libro (PRJ-1, TAR-3…) solo sirven de ancla interna del seed.
 */
import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/data-source';
import { Person } from '../modules/persons/domain/person.entity';
import { User } from '../modules/users/domain/user.entity';
import { PlanInstrument } from '../modules/plan/domain/plan-instrument.entity';
import { StrategicObjective } from '../modules/plan/domain/strategic-objective.entity';
import { LegalNorm } from '../modules/legal/domain/legal-norm.entity';
import { LegalObligation } from '../modules/legal/domain/legal-obligation.entity';
import { Project } from '../modules/portfolio/domain/project.entity';
import { Task } from '../modules/portfolio/domain/task.entity';
import { WorkNote } from '../modules/portfolio/domain/work-note.entity';
import {
  USER_ROLES,
  type UserRole,
} from '../modules/users/domain/user-roles';
import { Contractor } from '../modules/contracts/domain/contractor.entity';
import { Contract } from '../modules/contracts/domain/contract.entity';
import { ContractPeriod } from '../modules/contracts/domain/contract-period.entity';
import { ContractPeriodDocument } from '../modules/contracts/domain/contract-period-document.entity';
import { checklistForKind } from '../modules/contracts/domain/contract-kinds';
import { StaffMember } from '../modules/staff/domain/staff-member.entity';
import { StaffRequirementCheck } from '../modules/staff/domain/staff-requirement-check.entity';
import { art12Checklist } from '../modules/staff/domain/staff-kinds';
import { TaskAssignee } from '../modules/portfolio/domain/task-assignee.entity';
import { RecordCodeService } from '../modules/record-codes/application/record-code.service';
import {
  RECORD_CODE_PREFIXES,
  formatRecordCode,
  type RecordCodePrefix,
} from '../modules/record-codes/domain/record-code-prefix';

/** Asigna folios TTT+AA+NNNNNN y al final alinea `record_code_sequences`. */
class SeedCodeAllocator {
  private readonly seq: Record<RecordCodePrefix, number> = {
    PRY: 0,
    TAR: 0,
    CTR: 0,
    PER: 0,
    PSN: 0,
    AOP: 0,
    INC: 0,
    REQ: 0,
    OPE: 0,
    ITY: 0,
  };

  constructor(readonly year: number) {}

  matches(prefix: RecordCodePrefix, code: string | null | undefined): boolean {
    if (!code) return false;
    const aa = String(this.year).slice(-2);
    return new RegExp(`^${prefix}${aa}\\d{6}$`).test(code);
  }

  /** Registra un folio ya presente en BD para no reasignar el mismo correlativo. */
  observe(prefix: RecordCodePrefix, code: string | null | undefined): void {
    if (!this.matches(prefix, code)) return;
    const n = parseInt(String(code).slice(-6), 10);
    if (Number.isFinite(n) && n > this.seq[prefix]) {
      this.seq[prefix] = n;
    }
  }

  /** Reutiliza folio del año si ya es válido; si no, asigna el siguiente correlativo. */
  take(prefix: RecordCodePrefix, existing?: string | null): string {
    if (this.matches(prefix, existing)) {
      this.observe(prefix, existing);
      return existing as string;
    }
    this.seq[prefix] += 1;
    return formatRecordCode(prefix, this.year, this.seq[prefix]);
  }

  async warmFromDatabase(): Promise<void> {
    const persons = await AppDataSource.getRepository(Person).find({
      select: ['code'],
    });
    for (const p of persons) this.observe('PSN', p.code);

    const projects = await AppDataSource.getRepository(Project).find({
      select: ['code', 'kind'],
    });
    for (const p of projects) {
      if (p.kind === 'portfolio_task' || String(p.code).startsWith('TAR')) {
        this.observe('TAR', p.code);
      } else {
        this.observe('PRY', p.code);
      }
    }

    const tasks = await AppDataSource.getRepository(Task).find({
      select: ['code'],
    });
    for (const t of tasks) this.observe('TAR', t.code);

    const contracts = await AppDataSource.getRepository(Contract).find({
      select: ['code'],
    });
    for (const c of contracts) this.observe('CTR', c.code);

    const staff = await AppDataSource.getRepository(StaffMember).find({
      select: ['code'],
    });
    for (const s of staff) this.observe('PER', s.code);

    const areaRows = await AppDataSource.query<{ code: string }[]>(
      `SELECT code FROM operation_areas WHERE deleted_at IS NULL`,
    );
    for (const row of areaRows) this.observe('AOP', row.code);

    const incidentTypeRows = await AppDataSource.query<{ code: string }[]>(
      `SELECT code FROM incident_types WHERE deleted_at IS NULL`,
    );
    for (const row of incidentTypeRows) this.observe('ITY', row.code);

    const incRows = await AppDataSource.query<{ code: string }[]>(
      `SELECT code FROM incidencias WHERE deleted_at IS NULL`,
    );
    for (const row of incRows) this.observe('INC', row.code);

    const reqRows = await AppDataSource.query<{ code: string }[]>(
      `SELECT code FROM requerimientos WHERE deleted_at IS NULL`,
    );
    for (const row of reqRows) this.observe('REQ', row.code);

    const opeRows = await AppDataSource.query<{ code: string }[]>(
      `SELECT code FROM field_operations WHERE deleted_at IS NULL`,
    );
    for (const row of opeRows) this.observe('OPE', row.code);
  }

  async sync(service: RecordCodeService): Promise<void> {
    for (const prefix of RECORD_CODE_PREFIXES) {
      const min = this.seq[prefix];
      if (min > 0) {
        await service.ensureAtLeast(prefix, this.year, min);
      }
    }
  }
}

/** Prefiere fila con folio de sistema del año; si no, la primera. */
function preferSystemCode<T extends { code: string }>(
  rows: T[],
  codes: SeedCodeAllocator,
  prefix: RecordCodePrefix,
): T | null {
  if (!rows.length) return null;
  return rows.find((r) => codes.matches(prefix, r.code)) ?? rows[0];
}

/** Personas seed por perfil (username = rol salvo dirección configurable). */
const SEED_PROFILES: Array<{
  role: UserRole;
  username?: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
}> = [
  {
    role: 'direccion',
    documentNumber: '11.111.111-1',
    firstName: 'Dirección',
    lastName: 'DSP Parral',
    email: 'direccion@dsp.local',
  },
  {
    role: 'admin_sistema',
    documentNumber: '11.000.000-0',
    firstName: 'Admin',
    lastName: 'Sistema',
    email: 'admin_sistema@dsp.local',
  },
  {
    role: 'analisis_datos',
    documentNumber: '12.111.111-1',
    firstName: 'Analista',
    lastName: 'Datos',
    email: 'analisis_datos@dsp.local',
  },
  {
    role: 'analisis_sistemas',
    documentNumber: '12.222.222-2',
    firstName: 'Analista',
    lastName: 'Sistemas',
    email: 'analisis_sistemas@dsp.local',
  },
  {
    role: 'administrativo',
    documentNumber: '12.333.333-3',
    firstName: 'Administrativo',
    lastName: 'Personal',
    email: 'administrativo@dsp.local',
  },
  {
    role: 'its',
    documentNumber: '12.444.444-4',
    firstName: 'Inspector',
    lastName: 'ITS',
    email: 'its@dsp.local',
  },
  {
    role: 'prevencion',
    documentNumber: '33.333.333-3',
    firstName: 'Prevención',
    lastName: 'Comunitaria',
    email: 'prevencion@dsp.local',
  },
  {
    role: 'gestor',
    documentNumber: '22.222.222-2',
    firstName: 'Gestor',
    lastName: 'Territorial',
    email: 'gestor@dsp.local',
  },
  {
    role: 'jefe_operaciones',
    documentNumber: '44.111.111-1',
    firstName: 'Jefe',
    lastName: 'Operaciones',
    email: 'jefe_operaciones@dsp.local',
  },
  {
    role: 'operador_televigilancia',
    documentNumber: '44.222.222-2',
    firstName: 'Operador',
    lastName: 'Televigilancia',
    email: 'operador_televigilancia@dsp.local',
  },
  {
    role: 'inspector',
    documentNumber: '44.333.333-3',
    firstName: 'Inspector',
    lastName: 'SM Terreno',
    email: 'inspector@dsp.local',
  },
  {
    role: 'jefe_grd',
    documentNumber: '55.111.111-1',
    firstName: 'Jefe',
    lastName: 'GRD',
    email: 'jefe_grd@dsp.local',
  },
  {
    role: 'grd',
    documentNumber: '55.222.222-2',
    firstName: 'Apoyo',
    lastName: 'GRD',
    email: 'grd@dsp.local',
  },
];

function seedPasswordFor(role: UserRole, adminPass: string): string {
  if (role === 'direccion') return adminPass;
  if (role === 'gestor') {
    return process.env.DSP_SEED_GESTOR_PASSWORD || 'gestor123';
  }
  if (role === 'prevencion') {
    return process.env.DSP_SEED_PREVENCION_PASSWORD || 'prevencion123';
  }
  const envKey = `DSP_SEED_${role.toUpperCase()}_PASSWORD`;
  return process.env[envKey] || `${role}123`;
}

async function upsertPerson(
  data: {
    documentType: string;
    documentNumber: string;
    firstName: string;
    lastName: string;
    email: string;
  },
  codes: SeedCodeAllocator,
): Promise<Person> {
  const repo = AppDataSource.getRepository(Person);
  let person = await repo.findOne({
    where: {
      documentType: data.documentType,
      documentNumber: data.documentNumber,
    },
  });
  const code = codes.take('PSN', person?.code);
  if (!person) {
    person = repo.create({ ...data, code });
  } else {
    Object.assign(person, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      code,
    });
  }
  return repo.save(person);
}

async function upsertUser(data: {
  personaId: string;
  username: string;
  password: string;
  role: string;
}): Promise<User> {
  const repo = AppDataSource.getRepository(User);
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  const passwordHash = await bcrypt.hash(data.password, rounds);
  let user = await repo.findOne({ where: { username: data.username } });
  if (!user) {
    user = repo.create({
      personaId: data.personaId,
      username: data.username,
      passwordHash,
      role: data.role,
      status: 'active',
    });
  } else {
    user.personaId = data.personaId;
    user.passwordHash = passwordHash;
    user.role = data.role;
    user.status = 'active';
  }
  return repo.save(user);
}

async function seed() {
  const adminUser = process.env.DSP_SEED_ADMIN_USERNAME || 'direccion';
  const adminPass = process.env.DSP_SEED_ADMIN_PASSWORD;
  const adminEmail = process.env.DSP_SEED_ADMIN_EMAIL || 'direccion@dsp.local';

  if (!adminPass) {
    throw new Error('DSP_SEED_ADMIN_PASSWORD is required in core/.env');
  }

  if (SEED_PROFILES.length !== USER_ROLES.length) {
    throw new Error(
      `[seed] SEED_PROFILES (${SEED_PROFILES.length}) must cover all USER_ROLES (${USER_ROLES.length})`,
    );
  }

  await AppDataSource.initialize();
  console.log('[seed] connected');

  const seedYear = new Date().getFullYear();
  const codes = new SeedCodeAllocator(seedYear);
  const recordCodes = new RecordCodeService(AppDataSource);
  await codes.warmFromDatabase();
  console.log(`[seed] folios TTT+AA+NNNNNN · año ${seedYear}`);

  // --- Identity (un usuario por perfil de app) ---
  let direccion: User | null = null;
  const seededUsernames: string[] = [];

  for (const profile of SEED_PROFILES) {
    const username =
      profile.role === 'direccion' ? adminUser : (profile.username ?? profile.role);
    const email =
      profile.role === 'direccion' ? adminEmail : profile.email;
    const person = await upsertPerson(
      {
        documentType: 'RUT',
        documentNumber: profile.documentNumber,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email,
      },
      codes,
    );
    const user = await upsertUser({
      personaId: person.id,
      username,
      password: seedPasswordFor(profile.role, adminPass),
      role: profile.role,
    });
    if (profile.role === 'direccion') {
      direccion = user;
    }
    seededUsernames.push(username);
  }

  if (!direccion) {
    throw new Error('[seed] missing direccion user');
  }
  const direccionUser = direccion;

  console.log('[seed] users:', seededUsernames.join(', '));

  // --- Plan 2027 ---
  const planRepo = AppDataSource.getRepository(PlanInstrument);
  let plan = await planRepo.findOne({ where: { year: 2027 } });
  const missionText =
    'En 2027 la Dirección de Seguridad Pública de Parral conduce la seguridad comunal bajo la Ley N.º 21.802: deja vigente una orgánica capaz de ejecutar la cartera, aprueba el Plan Comunal que reemplaza al instrumento que vence en 2026, diseña y aplica un instrumento piloto de sensación de seguridad, prepara las condiciones para mejorarla y mejora sistemáticamente las operaciones —cobertura y capacidad de respuesta ante incivilidades y solicitudes de la comunidad. La misión no es acumular proyectos: es cerrar la brecha entre lo que la ley exige y lo que el diagnóstico muestra al cierre de 2026.';

  if (!plan) {
    plan = planRepo.create({
      year: 2027,
      title: 'Planificación DSP Parral 2027',
      version: '1.0',
      status: 'active',
      missionText,
      visionText: null,
      startsOn: '2027-01-01',
      endsOn: '2027-12-31',
    });
  } else {
    plan.title = 'Planificación DSP Parral 2027';
    plan.version = plan.version || '1.0';
    plan.status = 'active';
    plan.missionText = missionText;
    plan.startsOn = plan.startsOn ?? '2027-01-01';
    plan.endsOn = plan.endsOn ?? '2027-12-31';
  }
  plan = await planRepo.save(plan);

  const objRepo = AppDataSource.getRepository(StrategicObjective);
  const objectivesData = [
    {
      code: 'O1',
      title: 'Implementar la Ley N.º 21.802',
      rationale:
        'La Ley N.º 21.802 impone una arquitectura municipal de seguridad. Sin marco institucional (orgánica, Plan Comunal, inspectores, EPP), el resto de la cartera no tiene ancla legal.',
      verification:
        'Orgánica actualizada (PRJ-1); Consejo/Comité (PRJ-2); Plan Comunal (PRJ-3); calidad inspector/a si se confirma (TAR-3); EPP (PRJ-12).',
      outOfScope:
        'No sustituye el piloto de medición (O2), la preparación de sensación de seguridad (O3) ni la mejora sistemática de operaciones (O4).',
    },
    {
      code: 'O2',
      title:
        'Diseñar y aplicar un instrumento piloto de medición de la sensación de seguridad en la comuna',
      rationale:
        'La sensación de seguridad es el indicador clave municipal. En 2027 se limita a diseñar, aplicar y documentar un instrumento piloto, sin pretender validación formal.',
      verification:
        'Instrumento piloto aplicado y documentado (PRJ-15); bases o contrato para validación externa.',
      outOfScope:
        'No certifica una baja del indicador ni una medición “validada” en 2027.',
    },
    {
      code: 'O3',
      title:
        'Preparar las condiciones para mejorar la sensación de seguridad de la población',
      rationale:
        'Mientras O2 esté en fase piloto, O3 concentra acciones que propicien mejor sensación (presencia, difusión, dispositivos en fechas de alta afluencia).',
      verification:
        'Acciones de prevención y difusión ejecutadas (PRJ-14, PRJ-16, TAR-1/TAR-2); lecturas del piloto ajustan prevención sin meta de % certificada.',
      outOfScope:
        'No se verifica con baja certificada de percepción ni con “bajar delitos” solo desde bitácora.',
    },
    {
      code: 'O4',
      title: 'Mejorar sistemáticamente las operaciones municipales de seguridad',
      rationale:
        'O4 es cómo se hacen las operaciones: cobertura y capacidad de respuesta. Los medios técnicos (vigilancia, alerta, comunicaciones) son habilitadores.',
      verification:
        'Central municipal (PRJ-5); avance red/radio/presencia; canales de alerta y registro con respuesta/cierre.',
      outOfScope:
        'No es comprar más cámaras ni redefinir la orgánica (O1). No incluye otorgamiento de calidad de inspector/a (O1/TAR-3).',
    },
  ];

  const objectiveByCode: Record<string, StrategicObjective> = {};
  for (const o of objectivesData) {
    let row = await objRepo.findOne({
      where: { planInstrumentId: plan.id, code: o.code },
    });
    if (!row) {
      row = objRepo.create({
        planInstrumentId: plan.id,
        ...o,
        status: 'on_track',
      });
    } else {
      Object.assign(row, o);
    }
    row = await objRepo.save(row);
    objectiveByCode[o.code] = row;
  }
  console.log('[seed] plan 2027 + O1–O4');

  // --- Legal (Cap. 1 — catálogo; PDFs se adjuntan por API/UI) ---
  const normRepo = AppDataSource.getRepository(LegalNorm);
  const normsData: Array<{
    code: string;
    kind: string;
    numberLabel: string;
    shortTitle: string;
    summary: string;
    sortOrder: number;
    status?: string;
  }> = [
    {
      code: 'LEY-21802',
      kind: 'law',
      numberLabel: 'Ley N.º 21.802',
      shortTitle: 'Fortalecimiento de la seguridad pública municipal',
      summary:
        'Marco principal: orgánica DSP, calidad de inspector/a, televigilancia, alerta ciudadana, EPP y plazos transitorios.',
      sortOrder: 1,
    },
    {
      code: 'LEY-18695',
      kind: 'law',
      numberLabel: 'Ley N.º 18.695',
      shortTitle: 'Orgánica Constitucional de Municipalidades',
      summary:
        'Base orgánica municipal; ancla competencias y estructura que la Ley 21.802 especializa en seguridad pública.',
      sortOrder: 2,
    },
    {
      code: 'LEY-20965',
      kind: 'law',
      numberLabel: 'Ley N.º 20.965',
      shortTitle: 'Sistema de Seguridad Pública',
      summary:
        'Marco previo de seguridad pública comunal; contexto histórico y competencias complementarias.',
      sortOrder: 3,
    },
    {
      code: 'DS-MSP-97-2026',
      kind: 'decree',
      numberLabel: 'DS MSP N.º 97/2026',
      shortTitle: 'Reglamento de la Ley 21.802',
      summary:
        'Perfiles DS 97 (fiscalizador, coadyuvante, no operativo), requisitos de capacitación y nómina.',
      sortOrder: 4,
    },
    {
      code: 'LEY-19628',
      kind: 'law',
      numberLabel: 'Ley N.º 19.628',
      shortTitle: 'Protección de la vida privada',
      summary:
        'Tratamiento de datos personales en televigilancia, alertas y registros de la Dirección.',
      sortOrder: 5,
    },
    {
      code: 'LEY-21719',
      kind: 'law',
      numberLabel: 'Ley N.º 21.719',
      shortTitle: 'Protección de datos personales',
      summary:
        'Actualiza el régimen de datos personales aplicable a operaciones DSP y sistemas de información.',
      sortOrder: 6,
    },
    {
      code: 'BOL-18525-06',
      kind: 'bill',
      numberLabel: 'Boletín N.º 18.525-06',
      shortTitle: 'Ley corta de seguridad pública (en trámite)',
      summary:
        'Proyecto de ley en proceso; se sigue como marco potencial sin tratarlo como vigente.',
      sortOrder: 7,
      status: 'in_process',
    },
    {
      code: 'DE-03883-2026',
      kind: 'decree',
      numberLabel: 'Decreto Exento N.º 03883/2026',
      shortTitle: 'Reglamento municipal — orgánica DSP Parral',
      summary:
        'Instrumento municipal vigente de orgánica; objeto de actualización (cartera PRJ-1 / OBL-ORGANICA).',
      sortOrder: 8,
    },
  ];

  const normByCode: Record<string, LegalNorm> = {};
  for (const n of normsData) {
    const status = n.status ?? 'in_force';
    let row = await normRepo.findOne({ where: { code: n.code } });
    if (!row) {
      row = normRepo.create({
        code: n.code,
        kind: n.kind,
        numberLabel: n.numberLabel,
        shortTitle: n.shortTitle,
        summary: n.summary,
        sortOrder: n.sortOrder,
        status,
      });
    } else {
      row.kind = n.kind;
      row.numberLabel = n.numberLabel;
      row.shortTitle = n.shortTitle;
      row.summary = n.summary;
      row.sortOrder = n.sortOrder;
      row.status = status;
    }
    row = await normRepo.save(row);
    normByCode[n.code] = row;
  }

  const oblRepo = AppDataSource.getRepository(LegalObligation);
  let obl = await oblRepo.findOne({
    where: { code: 'OBL-ORGANICA' },
    relations: ['strategicObjectives', 'projects'],
  });
  if (!obl) {
    obl = oblRepo.create({
      legalNormId: normByCode['LEY-21802'].id,
      code: 'OBL-ORGANICA',
      articleRef: 'Ley 21.802 / Reglamento municipal',
      description:
        'Orgánica de la DSP actualizada en el Reglamento municipal (unidades y departamentos alineados a la ley).',
      status: 'open',
      strategicObjectives: [objectiveByCode['O1']],
      projects: [],
    });
  } else {
    obl.description =
      'Orgánica de la DSP actualizada en el Reglamento municipal (unidades y departamentos alineados a la ley).';
    obl.legalNormId = normByCode['LEY-21802'].id;
    obl.strategicObjectives = [objectiveByCode['O1']];
  }
  obl = await oblRepo.save(obl);
  console.log(
    `[seed] norms ${normsData.length} (${normsData.map((n) => n.code).join(', ')}) + OBL-ORGANICA`,
  );

  // --- Portfolio (cartera Astro seguridad-2027) ---
  // bookKey = ancla del libro (PRJ-*/TAR-*); code = folio de sistema (PRY/TAR + AA + NNNNNN).
  const projectRepo = AppDataSource.getRepository(Project);
  type SeedProject = {
    bookKey: string;
    kind: 'project' | 'portfolio_task';
    title: string;
    leadRole: string;
    summary: string;
    problem: string;
    scope?: string | null;
    objectiveCodes: string[];
    startsOn?: string;
    endsOn?: string;
    status?: string;
  };

  const projectsData: SeedProject[] = [
    {
      bookKey: 'PRJ-1',
      kind: 'project',
      title: 'Actualización orgánica DSP',
      leadRole: 'direccion',
      problem:
        'El Reglamento (D.E. 03883/2026 Art. 26) solo reconoce 13.1 y 13.2; no ancla unidades staff, inspectores SM, Central 24/7 ni parquímetros en la DSP.',
      summary:
        'Dictar el decreto que incorpore la orgánica objetivo al Reglamento: unidades de Análisis y Prevención, Depto. de Operaciones (reemplazo 13.1), mantener GRD y trasladar parquímetros desde Tránsito.',
      scope:
        'Actualización Art. 26 y traslado de gestión técnico-contractual de parquímetros (Art. 25° r)).',
      objectiveCodes: ['O1'],
    },
    {
      bookKey: 'PRJ-2',
      kind: 'project',
      title: 'Consejo y Comité',
      leadRole: 'direccion',
      problem:
        'Sin Consejo Comunal y Comité de Coordinación Operativa en régimen no hay sesiones ni observaciones formales al Plan Comunal.',
      summary:
        'Constituir o regularizar Consejo y Comité; fijar citaciones, sesiones y registro; operar la sesión de agosto 2027 y entregar observaciones a PRJ-3.',
      objectiveCodes: ['O1'],
    },
    {
      bookKey: 'PRJ-3',
      kind: 'project',
      title: 'Plan Comunal 2027',
      leadRole: 'analisis_datos',
      problem:
        'El plan vigente vence al término de 2026; sin reemplazo en el plazo legal (art. undécimo transitorio Ley 21.802) la comuna incumple.',
      summary:
        'Preparar, consultar y aprobar el Plan Comunal de Seguridad Pública que rige desde 2027, con horizonte anual o plurianual y actualización anual.',
      objectiveCodes: ['O1'],
    },
    {
      bookKey: 'PRJ-5',
      kind: 'project',
      title: 'Traslado Central de cámaras',
      leadRole: 'analisis_sistemas',
      problem:
        'La Central opera en la Tercera Comisaría; el espacio no alcanza para la ampliación de televigilancia bajo capacidad municipal.',
      summary:
        'Trasladar la Central a inmueble municipal dimensionado: antenas, continuidad de monitoreo, custodia de imágenes y capacidad para más cámaras.',
      scope: 'Inventario, ET/bases, traslado y custodia de imágenes.',
      objectiveCodes: ['O1', 'O4'],
    },
    {
      bookKey: 'PRJ-6',
      kind: 'project',
      title: 'Relicitación SUBDERE',
      leadRole: 'analisis_sistemas',
      problem:
        'La red de teleprotección SUBDERE requiere cierre contractual e integración operativa a la Central municipal.',
      summary:
        'Cerrar e integrar la red de 29 puntos de teleprotección a la operación de la Central, con continuidad de servicio y control municipal.',
      objectiveCodes: ['O4'],
    },
    {
      bookKey: 'PRJ-7',
      kind: 'project',
      title: 'Televigilancia edificios',
      leadRole: 'analisis_sistemas',
      problem:
        'Edificios municipales sin televigilancia propia conectada a la Central; falta diagnóstico y licitación por edificio.',
      summary:
        'Instalar o reparar cámaras en edificios municipales y conectarlas a la Central cuando opere en inmueble municipal (PRJ-5).',
      objectiveCodes: ['O4'],
    },
    {
      bookKey: 'PRJ-8',
      kind: 'project',
      title: 'Registro de grabaciones (EVS)',
      leadRole: 'analisis_sistemas',
      problem:
        'El aumento de cámaras (PRJ-5/6/7) exige más almacenamiento; sin EVS no se sostiene la retención legal de imágenes.',
      summary:
        'Ampliar el registro con servidor EVS y discos de escritura continua, instalados en la nueva Central (meta: sep. 2027).',
      endsOn: '2027-09-30',
      objectiveCodes: ['O4', 'O1'],
    },
    {
      bookKey: 'PRJ-9',
      kind: 'project',
      title: 'Integración SITIA',
      leadRole: 'analisis_sistemas',
      problem:
        'Tres LPR municipales operan localmente sin integración a SITIA-Patentes ni interoperabilidad con encargos de Carabineros.',
      summary:
        'Integrar las tres LPR ya operativas a SITIA-Patentes (adhesión, validación iVMS y alertas desde Central). No compra cámaras nuevas.',
      objectiveCodes: ['O4'],
    },
    {
      bookKey: 'PRJ-10',
      kind: 'project',
      title: 'Botón de pánico comerciantes',
      leadRole: 'analisis_sistemas',
      problem:
        'No hay canal de alerta ciudadana operativo para comerciantes (arts. 5°, 25° y 26°); la respuesta depende de llamada informal.',
      summary:
        'Implementar botones Bluetooth y recepción en servidor municipal; marcha blanca dic. 2026 y operación en 2027.',
      objectiveCodes: ['O1', 'O4', 'O3'],
    },
    {
      bookKey: 'PRJ-11',
      kind: 'project',
      title: 'Red de radiocomunicaciones',
      leadRole: 'analisis_sistemas',
      problem:
        'VHF simplex sin repetidor; pérdida de enlace ~10–12 km; sectores en cero (El Arandanal, Copihue, San Lorenzo, El Cairo, Fundo Era).',
      summary:
        'Pasar a red semidúplex con repetidor y dúplexor; elevar antena; ampliar portátiles y bases para cobertura territorial.',
      objectiveCodes: ['O4'],
    },
    {
      bookKey: 'PRJ-12',
      kind: 'project',
      title: 'Dotación de EPP',
      leadRole: 'administrativo',
      problem:
        'El DS MSP N.º 97/2026 fija EPP mínimos por perfil; la asignación conforme al decreto no está cerrada.',
      summary:
        'Adquirir y asignar EPP según perfiles DS 97 (arts. 37°, 42° y 43°), con capacitaciones antes de entregar elementos de fuerza.',
      objectiveCodes: ['O1'],
    },
    {
      bookKey: 'PRJ-13',
      kind: 'project',
      title: 'Aparcadero municipal',
      leadRole: 'its',
      problem:
        'El aparcadero municipal no figura en el Reglamento (D.E. 03883/2026); no hay proyecto ni contrato de implementación. Es distinto de los parquímetros (desalineación orgánica → PRJ-1 / Art. 25° r)).',
      summary:
        'Licitar e implementar en 2027 el aparcadero municipal (infraestructura/servicio nuevo), con ITS designado.',
      objectiveCodes: ['O1'],
    },
    {
      bookKey: 'PRJ-14',
      kind: 'project',
      title: 'Presencia territorial',
      leadRole: 'prevencion',
      problem:
        'Falta presencia regular en barrios y canal sistemático de consulta; sin ello O2/O3 no tienen línea territorial.',
      summary:
        'Sectores de partida: Plaza de Armas, Catillo, Villa San Pedro, Palma Rosa y Terminal de Buses. Ejecución periódica (ronda trimestral) puerta a puerta: visita a vecinos, vinculación preventiva (no patrullaje) y aplicación de instrumento de medición alineado a PRJ-15 para establecer el estado actual de percepción en el territorio. Partida mayo 2027.',
      startsOn: '2027-05-01',
      objectiveCodes: ['O2', 'O3', 'O4'],
    },
    {
      bookKey: 'PRJ-15',
      kind: 'project',
      title: 'Encuesta de percepción',
      leadRole: 'analisis_datos',
      problem:
        'No hay línea base comunal propia de percepción; sin medición trimestral O2 y O3 no se verifican. Victimización no es objetivo 2027.',
      summary:
        'Instrumento: cuestionario comunal de percepción (nov. 2026), muestra propia (no ENUSC nacional), alineado a PRJ-14; referencias ENUSC / Arce–Abarca / Urrutia; folleto breve de la encuesta. Aplicación: 4 olas (mar., jun., sep., dic. 2027); se registra tasa de respuesta; tras la 1ª se fija línea base y % de baja O3 (4ª vs 1ª); informes por ola alimentan prevención y PRJ-14.',
      objectiveCodes: ['O2', 'O3'],
    },
    {
      bookKey: 'PRJ-16',
      kind: 'project',
      title: 'Difusión y participación',
      leadRole: 'prevencion',
      problem:
        'Sin programa articulado de difusión (radio, redes, web) O3 pierde canal de información comunitaria.',
      summary:
        'Diseñar e implementar programa de medios (radio, redes y web informativa). No reemplaza PRJ-14 ni PRJ-11.',
      objectiveCodes: ['O3'],
    },
    {
      bookKey: 'TAR-1',
      kind: 'portfolio_task',
      title: 'Seguridad Vibra Fest 2027',
      leadRole: 'jefe_operaciones',
      problem:
        'Evento de alta afluencia (feb.) exige plan y dispositivo de seguridad municipal coordinado.',
      summary:
        'Elaborar y ejecutar el plan de seguridad del Vibra Fest 2027: dispositivo, coordinación FOSP y registro de incidencias.',
      startsOn: '2027-02-01',
      endsOn: '2027-02-28',
      objectiveCodes: ['O3', 'O4'],
    },
    {
      bookKey: 'TAR-2',
      kind: 'portfolio_task',
      title: 'Fiestas de las Tradiciones',
      leadRole: 'jefe_operaciones',
      problem:
        'Evento de alta afluencia (sep.) exige plan y dispositivo de seguridad municipal coordinado.',
      summary:
        'Elaborar y ejecutar el plan de seguridad de Fiestas de las Tradiciones: dispositivo, coordinación FOSP y registro de incidencias.',
      startsOn: '2027-09-01',
      endsOn: '2027-09-30',
      objectiveCodes: ['O3', 'O4'],
    },
    {
      bookKey: 'TAR-3',
      kind: 'portfolio_task',
      title: 'Calidad de inspector/a',
      leadRole: 'direccion',
      problem:
        'Sin calidad legal de inspector/a la DSP no puede ejercer plenas funciones del Párrafo 4° Ley 21.802 / DS 97.',
      summary:
        'Conducir el proceso RR.HH. de otorgamiento de la calidad de inspector/a de seguridad municipal cuando se confirme la vía administrativa.',
      scope: 'Perfiles DS 97; nómina art. 15°; articulación con PRJ-1 y PRJ-12.',
      objectiveCodes: ['O1'],
    },
  ];

  const projectByBook: Record<string, Project> = {};
  for (const p of projectsData) {
    const prefix: RecordCodePrefix = p.kind === 'portfolio_task' ? 'TAR' : 'PRY';
    let row =
      (await projectRepo.findOne({
        where: { title: p.title },
        relations: ['strategicObjectives'],
      })) ??
      (await projectRepo.findOne({
        where: { code: p.bookKey },
        relations: ['strategicObjectives'],
      }));
    const folio = codes.take(prefix, row?.code);
    const objectives = p.objectiveCodes.map((c) => objectiveByCode[c]);
    const startsOn = p.startsOn ?? '2027-01-01';
    const endsOn = p.endsOn ?? '2027-12-31';
    if (!row) {
      row = projectRepo.create({
        code: folio,
        kind: p.kind,
        title: p.title,
        status: p.status ?? 'in_progress',
        leadRole: p.leadRole,
        summary: p.summary,
        problem: p.problem,
        scope: p.scope ?? null,
        strategicObjectives: objectives,
        startsOn,
        endsOn,
      });
    } else {
      row.code = folio;
      row.title = p.title;
      row.kind = p.kind;
      row.leadRole = p.leadRole;
      row.summary = p.summary;
      row.problem = p.problem;
      row.scope = p.scope ?? null;
      row.strategicObjectives = objectives;
      row.startsOn = startsOn;
      row.endsOn = endsOn;
      row.status = row.status || p.status || 'in_progress';
    }
    row = await projectRepo.save(row);
    projectByBook[p.bookKey] = row;
  }

  const organicaProject = projectByBook['PRJ-1'];
  if (!organicaProject) {
    throw new Error('[seed] missing project bookKey PRJ-1');
  }

  // Link obligation → orgánica (libro PRJ-1)
  obl.projects = [organicaProject];
  obl.strategicObjectives = [objectiveByCode['O1']];
  await oblRepo.save(obl);

  // Task under orgánica + note
  const taskRepo = AppDataSource.getRepository(Task);
  const taskTitle = 'Antecedente técnico-jurídico de orgánica objetivo';
  let task =
    (await taskRepo.findOne({
      where: { projectId: organicaProject.id, title: taskTitle },
    })) ??
    (await taskRepo.findOne({
      where: { projectId: organicaProject.id, code: 'PRJ-1-T1' },
    }));
  const taskCode = codes.take('TAR', task?.code);
  if (!task) {
    task = taskRepo.create({
      projectId: organicaProject.id,
      code: taskCode,
      title: taskTitle,
      description:
        'Compilar propuesta de estructura y funciones DSP y enviar a Jurídico.',
      objectiveText:
        'Dejar listo el paquete técnico para el decreto de actualización orgánica.',
      status: 'in_progress',
      leadRole: 'direccion',
      startsOn: '2027-01-15',
      endsOn: '2027-03-31',
      sortOrder: 1,
    });
  } else {
    task.code = taskCode;
    task.title = taskTitle;
    task.startsOn = task.startsOn ?? '2027-01-15';
    task.endsOn = task.endsOn ?? '2027-03-31';
  }
  task = await taskRepo.save(task);

  const noteRepo = AppDataSource.getRepository(WorkNote);
  const existingNote = await noteRepo.findOne({
    where: { entityType: 'task', entityId: task.id },
  });
  if (!existingNote) {
    await noteRepo.save(
      noteRepo.create({
        entityType: 'task',
        entityId: task.id,
        body: 'Seed: iniciar revisión del Reglamento D.E. 03883/2026 Art. 26 con Jurídico.',
        authorUserId: direccionUser.id,
      }),
    );
  }

  console.log(
    `[seed] projects ${projectsData.length} fichas (${projectsData
      .map((p) => `${p.bookKey}→${projectByBook[p.bookKey].code}`)
      .join(', ')}) + task ${task.code}`,
  );

  // --- Contracts / ITS ---
  const itsUser = await AppDataSource.getRepository(User).findOne({
    where: { username: 'its' },
  });
  if (!itsUser) {
    throw new Error('[seed] missing its user');
  }

  const contractorRepo = AppDataSource.getRepository(Contractor);
  let contractor = await contractorRepo.findOne({
    where: { rut: '76.543.210-K' },
  });
  if (!contractor) {
    contractor = contractorRepo.create({
      rut: '76.543.210-K',
      name: 'Seguridad Andina SpA',
      email: 'contacto@seguridadandina.local',
      phone: '+56 9 1234 5678',
    });
  } else {
    contractor.name = 'Seguridad Andina SpA';
    contractor.email = 'contacto@seguridadandina.local';
  }
  contractor = await contractorRepo.save(contractor);

  const contractRepo = AppDataSource.getRepository(Contract);
  const contractTitle = 'Servicio de vigilancia privada — puntos municipales';
  const contractCandidates = await contractRepo.find({
    where: [{ title: contractTitle }, { code: 'CTR-2027-G01' }],
  });
  let contract = preferSystemCode(contractCandidates, codes, 'CTR');
  // Limpia duplicado legado si ya hay folio de sistema
  if (contract && codes.matches('CTR', contract.code)) {
    for (const dup of contractCandidates) {
      if (dup.id !== contract.id && dup.code === 'CTR-2027-G01') {
        await contractRepo.softDelete({ id: dup.id });
      }
    }
  }
  const contractCode = codes.take('CTR', contract?.code);
  if (!contract) {
    contract = contractRepo.create({
      code: contractCode,
      kind: 'guardias',
      title: contractTitle,
      status: 'active',
      contractorId: contractor.id,
      itsUserId: itsUser.id,
      projectId: null,
      startsOn: '2027-01-01',
      endsOn: '2027-12-31',
      notes: 'Seed: contrato de guardias bajo ITS.',
    });
  } else {
    contract.code = contractCode;
    contract.contractorId = contractor.id;
    contract.itsUserId = itsUser.id;
    contract.status = 'active';
    contract.title = contractTitle;
  }
  contract = await contractRepo.save(contract);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const periodRepo = AppDataSource.getRepository(ContractPeriod);
  let period = await periodRepo.findOne({
    where: { contractId: contract.id, year, month },
  });
  const due = new Date(Date.UTC(year, month, 0));
  const docsDueOn = `${due.getUTCFullYear()}-${String(due.getUTCMonth() + 1).padStart(2, '0')}-${String(due.getUTCDate()).padStart(2, '0')}`;
  if (!period) {
    period = periodRepo.create({
      contractId: contract.id,
      year,
      month,
      status: 'docs_pending',
      docsDueOn,
      certifiedAt: null,
      certificationNotes: null,
    });
  } else if (period.status !== 'certified') {
    period.docsDueOn = docsDueOn;
  }
  period = await periodRepo.save(period);

  const docRepo = AppDataSource.getRepository(ContractPeriodDocument);
  const types = checklistForKind('guardias');
  for (let i = 0; i < types.length; i++) {
    const docType = types[i];
    let doc = await docRepo.findOne({
      where: { periodId: period.id, docType },
    });
    const status = i === 0 ? 'received' : 'missing';
    if (!doc) {
      doc = docRepo.create({
        periodId: period.id,
        docType,
        status,
        notes: null,
      });
    } else if (period.status !== 'certified' && doc.status === 'missing' && i === 0) {
      doc.status = 'received';
    }
    await docRepo.save(doc);
  }

  console.log(
    `[seed] contracts ${contract.code} + período ${year}-${String(month).padStart(2, '0')} (${types.length} docs)`,
  );

  // --- Staff / personal afecto ---
  type StaffSeed = {
    username?: string;
    unit: string;
    ds97Profile: string | null;
    inspectorQuality: string;
    approveAll?: boolean;
    appointmentAt?: string;
    priorToLaw?: boolean;
    employeeNumber?: string;
  };

  const staffSeeds: StaffSeed[] = [
    {
      username: 'direccion',
      unit: 'direccion',
      ds97Profile: 'no_operativo',
      inspectorQuality: 'none',
    },
    {
      username: 'administrativo',
      unit: 'direccion',
      ds97Profile: 'no_operativo',
      inspectorQuality: 'none',
    },
    {
      username: 'its',
      unit: 'operaciones',
      ds97Profile: 'fiscalizador',
      inspectorQuality: 'pending',
      approveAll: true,
      appointmentAt: '2026-09-01',
      employeeNumber: 'DSP-ITS-01',
    },
    {
      username: 'inspector',
      unit: 'operaciones',
      ds97Profile: 'fiscalizador',
      inspectorQuality: 'granted',
      approveAll: true,
      appointmentAt: '2026-08-01',
      priorToLaw: true,
      employeeNumber: 'DSP-INSP-01',
    },
    {
      username: 'operador_televigilancia',
      unit: 'operaciones',
      ds97Profile: 'coadyuvante',
      inspectorQuality: 'none',
    },
    {
      username: 'prevencion',
      unit: 'prevencion',
      ds97Profile: 'no_operativo',
      inspectorQuality: 'none',
    },
    {
      username: 'jefe_operaciones',
      unit: 'operaciones',
      ds97Profile: 'fiscalizador',
      inspectorQuality: 'none',
    },
  ];

  const staffRepo = AppDataSource.getRepository(StaffMember);
  const checkRepo = AppDataSource.getRepository(StaffRequirementCheck);
  const personRepo = AppDataSource.getRepository(Person);
  const userRepo = AppDataSource.getRepository(User);
  const seededStaffCodes: string[] = [];
  let inspectorStaff: StaffMember | null = null;

  for (const row of staffSeeds) {
    const username =
      row.username === 'direccion' ? adminUser : row.username!;
    const user = await userRepo.findOne({ where: { username } });
    if (!user) {
      throw new Error(`[seed] missing user ${username} for staff`);
    }
    let staff = await staffRepo.findOne({
      where: { personaId: user.personaId },
    });
    const folio = codes.take('PER', staff?.code);
    if (!staff) {
      staff = staffRepo.create({
        code: folio,
        personaId: user.personaId,
        unit: row.unit,
        ds97Profile: row.ds97Profile,
        inspectorQualityStatus: row.inspectorQuality,
        appointmentAt: row.appointmentAt ?? null,
        priorToLaw: row.priorToLaw ?? false,
        employeeNumber: row.employeeNumber ?? null,
        workEmail: null,
        status: 'active',
      });
    } else {
      staff.code = folio;
    }
    staff.unit = row.unit;
    staff.ds97Profile = row.ds97Profile;
    staff.inspectorQualityStatus = row.inspectorQuality;
    staff.appointmentAt = row.appointmentAt ?? staff.appointmentAt;
    staff.priorToLaw = row.priorToLaw ?? staff.priorToLaw;
    staff.employeeNumber = row.employeeNumber ?? staff.employeeNumber;
    staff.status = 'active';
    staff = await staffRepo.save(staff);

    for (const requirementCode of art12Checklist()) {
      let check = await checkRepo.findOne({
        where: { staffId: staff.id, requirementCode },
      });
      const status = row.approveAll ? 'approved' : 'missing';
      if (!check) {
        check = checkRepo.create({
          staffId: staff.id,
          requirementCode,
          status,
          notes: null,
        });
      } else if (row.approveAll) {
        check.status = 'approved';
      }
      await checkRepo.save(check);
    }
    seededStaffCodes.push(staff.code);
    if (row.username === 'inspector') {
      inspectorStaff = staff;
    }
  }

  // Expediente sin cuenta de usuario (RUT distinto de humo/admin users)
  const orphanDoc = '99.111.222-3';
  let orphanPerson = await personRepo.findOne({
    where: { documentNumber: orphanDoc },
  });
  // Migrar legado P-ORPH / RUT anterior del seed
  if (!orphanPerson) {
    orphanPerson = await personRepo.findOne({
      where: { documentNumber: '99.888.777-6', firstName: 'Camila' },
    });
  }
  const orphanPersonCode = codes.take('PSN', orphanPerson?.code);
  if (!orphanPerson) {
    orphanPerson = personRepo.create({
      documentType: 'RUT',
      documentNumber: orphanDoc,
      firstName: 'Camila',
      lastName: 'Sin Cuenta',
      email: 'camila.sincuenta@dsp.local',
      code: orphanPersonCode,
    });
  } else {
    orphanPerson.documentNumber = orphanDoc;
    orphanPerson.firstName = 'Camila';
    orphanPerson.lastName = 'Sin Cuenta';
    orphanPerson.email = 'camila.sincuenta@dsp.local';
    orphanPerson.code = orphanPersonCode;
  }
  orphanPerson = await personRepo.save(orphanPerson);

  let orphanStaff = await staffRepo.findOne({
    where: { personaId: orphanPerson.id },
  });
  if (!orphanStaff) {
    orphanStaff = await staffRepo.findOne({ where: { code: 'STF-ORPH' } });
  }
  const orphanStaffCode = codes.take('PER', orphanStaff?.code);
  if (!orphanStaff) {
    orphanStaff = staffRepo.create({
      code: orphanStaffCode,
      personaId: orphanPerson.id,
      unit: 'operaciones',
      ds97Profile: 'fiscalizador',
      inspectorQualityStatus: 'none',
      appointmentAt: '2026-10-01',
      priorToLaw: false,
      employeeNumber: 'DSP-NEW-01',
      workEmail: null,
      status: 'active',
    });
  }
  orphanStaff.code = orphanStaffCode;
  orphanStaff.personaId = orphanPerson.id;
  orphanStaff.unit = 'operaciones';
  orphanStaff.ds97Profile = 'fiscalizador';
  orphanStaff.status = 'active';
  orphanStaff = await staffRepo.save(orphanStaff);
  for (const requirementCode of art12Checklist()) {
    let check = await checkRepo.findOne({
      where: { staffId: orphanStaff.id, requirementCode },
    });
    if (!check) {
      check = checkRepo.create({
        staffId: orphanStaff.id,
        requirementCode,
        status: 'missing',
        notes: null,
      });
      await checkRepo.save(check);
    }
  }
  seededStaffCodes.push(orphanStaff.code);

  console.log(
    `[seed] staff ${seededStaffCodes.length} fichas (${seededStaffCodes.join(', ')})`,
  );

  // Asignar inspector a la tarea de orgánica + nota de actividad
  const inspectorUser = await userRepo.findOne({
    where: { username: 'inspector' },
  });
  const inspStaff = inspectorStaff;
  if (inspectorUser && inspStaff && task) {
    const assigneeRepo = AppDataSource.getRepository(TaskAssignee);
    // XOR person/staff: prefer staff_id for personal afecto
    let assign = await assigneeRepo.findOne({
      where: { taskId: task.id, staffId: inspStaff.id },
    });
    if (!assign) {
      assign = await assigneeRepo.findOne({
        where: { taskId: task.id, personId: inspectorUser.personaId },
      });
    }
    if (!assign) {
      assign = assigneeRepo.create({
        taskId: task.id,
        subtaskId: null,
        personId: null,
        staffId: inspStaff.id,
        assignmentRole: 'executor',
        assignedAt: new Date(),
        unassignedAt: null,
        assignedByUserId: direccionUser.id,
      });
    } else {
      assign.staffId = inspStaff.id;
      assign.personId = null;
      assign.unassignedAt = null;
      assign.assignmentRole = 'executor';
    }
    await assigneeRepo.save(assign);

    const activityNotes = AppDataSource.getRepository(WorkNote);
    const existingInspNote = await activityNotes.findOne({
      where: {
        entityType: 'task',
        entityId: task.id,
        authorUserId: inspectorUser.id,
      },
    });
    if (!existingInspNote) {
      await activityNotes.save(
        activityNotes.create({
          entityType: 'task',
          entityId: task.id,
          body: `Seed: revisión en terreno de la tarea ${task.code} (actividad inspector).`,
          authorUserId: inspectorUser.id,
        }),
      );
    }
    console.log(
      `[seed] staff activity: ${inspStaff.code} → task ${task.code} + note`,
    );
  }

  // Áreas de operación: tipos administrables + 5 sectores de partida (Parral)
  const areaTypeDefs: Array<{
    code: string;
    name: string;
    description: string;
    color: string;
    sortOrder: number;
  }> = [
    {
      code: 'territorio',
      name: 'Territorio',
      description: 'División mayor de intervención DSP',
      color: '#1e73ae',
      sortOrder: 10,
    },
    {
      code: 'sector',
      name: 'Sector',
      description: 'Sector de prevención / rondas (PRJ-14)',
      color: '#c45c26',
      sortOrder: 20,
    },
    {
      code: 'barrio',
      name: 'Barrio',
      description: 'Subdivisión dentro de un sector',
      color: '#2d6a4f',
      sortOrder: 30,
    },
  ];

  const typeIdByCode = new Map<string, string>();
  for (const def of areaTypeDefs) {
    const existing = await AppDataSource.query<
      Array<{ id: string }>
    >(
      `SELECT id FROM operation_area_types WHERE code = $1 AND deleted_at IS NULL LIMIT 1`,
      [def.code],
    );
    if (existing[0]) {
      await AppDataSource.query(
        `
        UPDATE operation_area_types
        SET name = $2, description = $3, color = $4, sort_order = $5,
            status = 'active', updated_at = now()
        WHERE id = $1
        `,
        [existing[0].id, def.name, def.description, def.color, def.sortOrder],
      );
      typeIdByCode.set(def.code, existing[0].id);
    } else {
      const inserted = await AppDataSource.query<
        Array<{ id: string }>
      >(
        `
        INSERT INTO operation_area_types (
          code, name, description, color, sort_order, status
        ) VALUES ($1, $2, $3, $4, $5, 'active')
        RETURNING id
        `,
        [def.code, def.name, def.description, def.color, def.sortOrder],
      );
      typeIdByCode.set(def.code, inserted[0].id);
    }
  }
  console.log(
    `[seed] operation_area_types: ${[...typeIdByCode.keys()].join(', ')}`,
  );

  /** Polígono aproximado centrado en (lng, lat) — anillo cerrado GeoJSON. */
  function boxAround(
    lng: number,
    lat: number,
    dLng = 0.008,
    dLat = 0.006,
  ): { type: 'Polygon'; coordinates: number[][][] } {
    const ring = [
      [lng - dLng, lat - dLat],
      [lng + dLng, lat - dLat],
      [lng + dLng, lat + dLat],
      [lng - dLng, lat + dLat],
      [lng - dLng, lat - dLat],
    ];
    return { type: 'Polygon', coordinates: [ring] };
  }

  const sectorTypeId = typeIdByCode.get('sector');
  if (!sectorTypeId) {
    throw new Error('[seed] falta tipo sector');
  }

  const sectorSeeds: Array<{
    name: string;
    lng: number;
    lat: number;
  }> = [
    { name: 'Plaza de Armas', lng: -71.8265, lat: -36.1415 },
    { name: 'Catillo', lng: -71.838, lat: -36.148 },
    { name: 'Villa San Pedro', lng: -71.815, lat: -36.135 },
    { name: 'Palma Rosa', lng: -71.845, lat: -36.132 },
    { name: 'Terminal de Buses', lng: -71.82, lat: -36.155 },
  ];

  const seededAreaCodes: string[] = [];
  for (const sector of sectorSeeds) {
    const existing = await AppDataSource.query<
      Array<{ id: string; code: string }>
    >(
      `
      SELECT id, code FROM operation_areas
      WHERE name = $1 AND type_id = $2 AND deleted_at IS NULL
      LIMIT 1
      `,
      [sector.name, sectorTypeId],
    );
    const code = codes.take('AOP', existing[0]?.code);
    const geometry = boxAround(sector.lng, sector.lat);
    if (existing[0]) {
      await AppDataSource.query(
        `
        UPDATE operation_areas
        SET code = $2, name = $3, type_id = $4, parent_id = NULL,
            geom = ST_SetSRID(ST_GeomFromGeoJSON($5), 4326)::geography,
            status = 'active', notes = $6, updated_at = now()
        WHERE id = $1
        `,
        [
          existing[0].id,
          code,
          sector.name,
          sectorTypeId,
          JSON.stringify(geometry),
          'Seed PRJ-14 — polígono aproximado Parral',
        ],
      );
    } else {
      await AppDataSource.query(
        `
        INSERT INTO operation_areas (
          code, name, type_id, parent_id, geom, status, notes
        ) VALUES (
          $1, $2, $3, NULL,
          ST_SetSRID(ST_GeomFromGeoJSON($4), 4326)::geography,
          'active', $5
        )
        `,
        [
          code,
          sector.name,
          sectorTypeId,
          JSON.stringify(geometry),
          'Seed PRJ-14 — polígono aproximado Parral',
        ],
      );
    }
    seededAreaCodes.push(code);
  }
  console.log(
    `[seed] operation_areas sectores: ${seededAreaCodes.join(', ')}`,
  );

  // Flujo operativo: catálogos + casos demo
  const incidentTypeDefs = [
    { code: 'ruido', name: 'Ruido molesto', sortOrder: 10 },
    { code: 'consumo_alcohol', name: 'Consumo de alcohol en vía pública', sortOrder: 20 },
    { code: 'riña', name: 'Riña / altercado', sortOrder: 30 },
    { code: 'daño_bienes', name: 'Daño a bienes públicos', sortOrder: 40 },
    { code: 'comercio_ambulante', name: 'Comercio ambulante irregular', sortOrder: 50 },
  ];
  const incidentTypeIds = new Map<string, string>();
  for (const def of incidentTypeDefs) {
    const existing = await AppDataSource.query<Array<{ id: string }>>(
      `SELECT id FROM incident_types WHERE code = $1 AND deleted_at IS NULL LIMIT 1`,
      [def.code],
    );
    if (existing[0]) {
      await AppDataSource.query(
        `UPDATE incident_types SET name = $2, sort_order = $3, status = 'active', updated_at = now() WHERE id = $1`,
        [existing[0].id, def.name, def.sortOrder],
      );
      incidentTypeIds.set(def.code, existing[0].id);
    } else {
      const inserted = await AppDataSource.query<Array<{ id: string }>>(
        `INSERT INTO incident_types (code, name, sort_order, status) VALUES ($1, $2, $3, 'active') RETURNING id`,
        [def.code, def.name, def.sortOrder],
      );
      incidentTypeIds.set(def.code, inserted[0].id);
    }
  }

  const operationTypeDefs = [
    { code: 'ronda', name: 'Ronda preventiva', sortOrder: 10 },
    { code: 'fiscalizacion', name: 'Fiscalización en terreno', sortOrder: 20 },
    { code: 'mediacion', name: 'Mediación / orientación', sortOrder: 30 },
    { code: 'apoyo_evento', name: 'Apoyo a evento', sortOrder: 40 },
  ];
  const operationTypeIds = new Map<string, string>();
  for (const def of operationTypeDefs) {
    const existing = await AppDataSource.query<Array<{ id: string }>>(
      `SELECT id FROM operation_types WHERE code = $1 AND deleted_at IS NULL LIMIT 1`,
      [def.code],
    );
    if (existing[0]) {
      await AppDataSource.query(
        `UPDATE operation_types SET name = $2, sort_order = $3, status = 'active', updated_at = now() WHERE id = $1`,
        [existing[0].id, def.name, def.sortOrder],
      );
      operationTypeIds.set(def.code, existing[0].id);
    } else {
      const inserted = await AppDataSource.query<Array<{ id: string }>>(
        `INSERT INTO operation_types (code, name, sort_order, status) VALUES ($1, $2, $3, 'active') RETURNING id`,
        [def.code, def.name, def.sortOrder],
      );
      operationTypeIds.set(def.code, inserted[0].id);
    }
  }

  const plazaArea = await AppDataSource.query<Array<{ id: string }>>(
    `SELECT id FROM operation_areas WHERE name = 'Plaza de Armas' AND deleted_at IS NULL LIMIT 1`,
  );
  const plazaAreaId = plazaArea[0]?.id ?? null;
  const ruidoTypeId = incidentTypeIds.get('ruido')!;
  const rinaTypeId = incidentTypeIds.get('riña')!;
  const rondaOpTypeId = operationTypeIds.get('ronda')!;
  const fiscalOpTypeId = operationTypeIds.get('fiscalizacion')!;

  async function upsertIncidencia(seedKey: string, data: {
    title: string;
    descripcion: string;
    incidentTypeId: string;
    status: string;
  }): Promise<{ id: string; code: string }> {
    const existing = await AppDataSource.query<
      Array<{ id: string; code: string }>
    >(
      `SELECT id, code FROM incidencias WHERE title = $1 AND deleted_at IS NULL LIMIT 1`,
      [data.title],
    );
    const code = codes.take('INC', existing[0]?.code);
    if (existing[0]) {
      await AppDataSource.query(
        `UPDATE incidencias SET code = $2, status = $3, title = $4, descripcion = $5,
         incident_type_id = $6, area_id = $7, updated_at = now() WHERE id = $1`,
        [
          existing[0].id,
          code,
          data.status,
          data.title,
          data.descripcion,
          data.incidentTypeId,
          plazaAreaId,
        ],
      );
      return { id: existing[0].id, code };
    }
    const inserted = await AppDataSource.query<Array<{ id: string }>>(
      `INSERT INTO incidencias (
        code, status, title, descripcion, incident_type_id, area_id,
        ingress_channel, registration_origin
      ) VALUES ($1, $2, $3, $4, $5, $6, 'central', 'dispatch_entry') RETURNING id`,
      [
        code,
        data.status,
        data.title,
        data.descripcion,
        data.incidentTypeId,
        plazaAreaId,
      ],
    );
    return { id: inserted[0].id, code };
  }

  const inc1 = await upsertIncidencia('inc1', {
    title: 'Ruido en Plaza de Armas',
    descripcion: 'Seed: denuncia de ruido nocturno cerca de la plaza.',
    incidentTypeId: ruidoTypeId,
    status: 'sin_verificar',
  });
  const inc2 = await upsertIncidencia('inc2', {
    title: 'Altercado en Terminal',
    descripcion: 'Seed: altercado verbal en acceso al terminal.',
    incidentTypeId: rinaTypeId,
    status: 'verificada',
  });

  async function upsertReq(titleKey: string, data: {
    descripcion: string;
    prioridad: string;
    status: string;
    incidenciaId: string | null;
  }): Promise<{ id: string; code: string }> {
    const existing = await AppDataSource.query<
      Array<{ id: string; code: string }>
    >(
      `SELECT id, code FROM requerimientos WHERE descripcion = $1 AND deleted_at IS NULL LIMIT 1`,
      [data.descripcion],
    );
    const code = codes.take('REQ', existing[0]?.code);
    if (existing[0]) {
      await AppDataSource.query(
        `UPDATE requerimientos SET code = $2, status = $3, prioridad = $4, incidencia_id = $5,
         area_id = $6, updated_at = now() WHERE id = $1`,
        [
          existing[0].id,
          code,
          data.status,
          data.prioridad,
          data.incidenciaId,
          plazaAreaId,
        ],
      );
      return { id: existing[0].id, code };
    }
    const inserted = await AppDataSource.query<Array<{ id: string }>>(
      `INSERT INTO requerimientos (
        code, status, prioridad, descripcion, area_id, incidencia_id
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        code,
        data.status,
        data.prioridad,
        data.descripcion,
        plazaAreaId,
        data.incidenciaId,
      ],
    );
    return { id: inserted[0].id, code };
  }

  const req1 = await upsertReq('req1', {
    descripcion: 'Seed: solicitud de ronda por ruido en Plaza de Armas.',
    prioridad: 'P1',
    status: 'en_gestion',
    incidenciaId: inc1.id,
  });
  await AppDataSource.query(
    `UPDATE incidencias SET requerimiento_id = $2, updated_at = now() WHERE id = $1`,
    [inc1.id, req1.id],
  );
  const req2 = await upsertReq('req2', {
    descripcion: 'Seed: solicitud de orientación en Villa San Pedro (sin incidencia).',
    prioridad: 'P2',
    status: 'ingresado',
    incidenciaId: null,
  });

  async function upsertOp(briefing: string, data: {
    status: string;
    triggerType: string;
    operationTypeId: string;
    requerimientoId: string | null;
    incidenciaId: string | null;
    prioridad: string;
  }): Promise<string> {
    const existing = await AppDataSource.query<
      Array<{ id: string; code: string }>
    >(
      `SELECT id, code FROM field_operations WHERE briefing = $1 AND deleted_at IS NULL LIMIT 1`,
      [briefing],
    );
    const code = codes.take('OPE', existing[0]?.code);
    if (existing[0]) {
      await AppDataSource.query(
        `UPDATE field_operations SET code = $2, status = $3, trigger_type = $4, prioridad = $5,
         operation_type_id = $6, requerimiento_id = $7, incidencia_id = $8, area_id = $9,
         briefing = $10, updated_at = now() WHERE id = $1`,
        [
          existing[0].id,
          code,
          data.status,
          data.triggerType,
          data.prioridad,
          data.operationTypeId,
          data.requerimientoId,
          data.incidenciaId,
          plazaAreaId,
          briefing,
        ],
      );
      return code;
    }
    await AppDataSource.query(
      `INSERT INTO field_operations (
        code, status, trigger_type, prioridad, briefing, operation_type_id,
        requerimiento_id, incidencia_id, area_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        code,
        data.status,
        data.triggerType,
        data.prioridad,
        briefing,
        data.operationTypeId,
        data.requerimientoId,
        data.incidenciaId,
        plazaAreaId,
      ],
    );
    return code;
  }

  const ope1 = await upsertOp('Seed: ronda por ruido Plaza de Armas', {
    status: 'asignada',
    triggerType: 'requerimiento',
    operationTypeId: rondaOpTypeId,
    requerimientoId: req1.id,
    incidenciaId: inc1.id,
    prioridad: 'P1',
  });
  const ope2 = await upsertOp('Seed: fiscalización Terminal (desde incidencia)', {
    status: 'en_traslado',
    triggerType: 'incidencia',
    operationTypeId: fiscalOpTypeId,
    requerimientoId: null,
    incidenciaId: inc2.id,
    prioridad: 'P2',
  });

  console.log(
    `[seed] operational-cases: Inc ${inc1.code},${inc2.code}; Req ${req1.code},${req2.code}; Op ${ope1},${ope2}`,
  );

  await codes.sync(recordCodes);
  console.log(
    `[seed] record_code_sequences alineadas (año ${seedYear})`,
  );

  console.log('[seed] done');
  await AppDataSource.destroy();
}

seed().catch(async (err) => {
  console.error('[seed] failed', err);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
