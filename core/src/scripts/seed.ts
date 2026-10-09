/**
 * Idempotent development seed for DSP-27.
 * Usage: npm run seed (from root or core workspace)
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

/** Personas seed por perfil (username = rol salvo dirección configurable). */
const SEED_PROFILES: Array<{
  role: UserRole;
  username?: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  code: string;
}> = [
  {
    role: 'direccion',
    documentNumber: '11.111.111-1',
    firstName: 'Dirección',
    lastName: 'DSP Parral',
    email: 'direccion@dsp.local',
    code: 'P-DIR',
  },
  {
    role: 'analisis_datos',
    documentNumber: '12.111.111-1',
    firstName: 'Analista',
    lastName: 'Datos',
    email: 'analisis_datos@dsp.local',
    code: 'P-AD',
  },
  {
    role: 'analisis_sistemas',
    documentNumber: '12.222.222-2',
    firstName: 'Analista',
    lastName: 'Sistemas',
    email: 'analisis_sistemas@dsp.local',
    code: 'P-AS',
  },
  {
    role: 'administrativo',
    documentNumber: '12.333.333-3',
    firstName: 'Administrativo',
    lastName: 'Personal',
    email: 'administrativo@dsp.local',
    code: 'P-ADM',
  },
  {
    role: 'its',
    documentNumber: '12.444.444-4',
    firstName: 'Inspector',
    lastName: 'ITS',
    email: 'its@dsp.local',
    code: 'P-ITS',
  },
  {
    role: 'prevencion',
    documentNumber: '33.333.333-3',
    firstName: 'Prevención',
    lastName: 'Comunitaria',
    email: 'prevencion@dsp.local',
    code: 'P-PRE',
  },
  {
    role: 'gestor',
    documentNumber: '22.222.222-2',
    firstName: 'Gestor',
    lastName: 'Territorial',
    email: 'gestor@dsp.local',
    code: 'P-GES',
  },
  {
    role: 'jefe_operaciones',
    documentNumber: '44.111.111-1',
    firstName: 'Jefe',
    lastName: 'Operaciones',
    email: 'jefe_operaciones@dsp.local',
    code: 'P-JOP',
  },
  {
    role: 'operador_televigilancia',
    documentNumber: '44.222.222-2',
    firstName: 'Operador',
    lastName: 'Televigilancia',
    email: 'operador_televigilancia@dsp.local',
    code: 'P-OTV',
  },
  {
    role: 'inspector',
    documentNumber: '44.333.333-3',
    firstName: 'Inspector',
    lastName: 'SM Terreno',
    email: 'inspector@dsp.local',
    code: 'P-INS',
  },
  {
    role: 'jefe_grd',
    documentNumber: '55.111.111-1',
    firstName: 'Jefe',
    lastName: 'GRD',
    email: 'jefe_grd@dsp.local',
    code: 'P-JGRD',
  },
  {
    role: 'grd',
    documentNumber: '55.222.222-2',
    firstName: 'Apoyo',
    lastName: 'GRD',
    email: 'grd@dsp.local',
    code: 'P-GRD',
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

async function upsertPerson(data: {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  code?: string;
}): Promise<Person> {
  const repo = AppDataSource.getRepository(Person);
  let person = await repo.findOne({
    where: {
      documentType: data.documentType,
      documentNumber: data.documentNumber,
    },
  });
  if (!person) {
    person = repo.create(data);
  } else {
    Object.assign(person, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      code: data.code ?? person.code,
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

  // --- Identity (un usuario por perfil de app) ---
  let direccion: User | null = null;
  const seededUsernames: string[] = [];

  for (const profile of SEED_PROFILES) {
    const username =
      profile.role === 'direccion' ? adminUser : (profile.username ?? profile.role);
    const email =
      profile.role === 'direccion' ? adminEmail : profile.email;
    const person = await upsertPerson({
      documentType: 'RUT',
      documentNumber: profile.documentNumber,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email,
      code: profile.code,
    });
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

  // --- Legal ---
  const normRepo = AppDataSource.getRepository(LegalNorm);
  const normsData = [
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
      code: 'DS-MSP-97-2026',
      kind: 'decree',
      numberLabel: 'DS MSP N.º 97/2026',
      shortTitle: 'Reglamento de la Ley 21.802',
      summary:
        'Perfiles DS 97 (fiscalizador, coadyuvante, no operativo), requisitos de capacitación y nómina.',
      sortOrder: 2,
    },
  ];

  const normByCode: Record<string, LegalNorm> = {};
  for (const n of normsData) {
    let row = await normRepo.findOne({ where: { code: n.code } });
    if (!row) {
      row = normRepo.create({ ...n, status: 'in_force' });
    } else {
      Object.assign(row, n);
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
  console.log('[seed] norms + OBL-ORGANICA');

  // --- Portfolio (cartera Astro seguridad-2027) ---
  const projectRepo = AppDataSource.getRepository(Project);
  type SeedProject = {
    code: string;
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
      code: 'PRJ-1',
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
      code: 'PRJ-2',
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
      code: 'PRJ-3',
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
      code: 'PRJ-5',
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
      code: 'PRJ-6',
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
      code: 'PRJ-7',
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
      code: 'PRJ-8',
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
      code: 'PRJ-9',
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
      code: 'PRJ-10',
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
      code: 'PRJ-11',
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
      code: 'PRJ-12',
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
      code: 'PRJ-13',
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
      code: 'PRJ-14',
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
      code: 'PRJ-15',
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
      code: 'PRJ-16',
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
      code: 'TAR-1',
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
      code: 'TAR-2',
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
      code: 'TAR-3',
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

  const projectByCode: Record<string, Project> = {};
  for (const p of projectsData) {
    let row = await projectRepo.findOne({
      where: { code: p.code },
      relations: ['strategicObjectives'],
    });
    const objectives = p.objectiveCodes.map((c) => objectiveByCode[c]);
    const startsOn = p.startsOn ?? '2027-01-01';
    const endsOn = p.endsOn ?? '2027-12-31';
    if (!row) {
      row = projectRepo.create({
        code: p.code,
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
    projectByCode[p.code] = row;
  }

  // Link obligation → PRJ-1
  obl.projects = [projectByCode['PRJ-1']];
  obl.strategicObjectives = [objectiveByCode['O1']];
  await oblRepo.save(obl);

  // Task under PRJ-1 + note
  const taskRepo = AppDataSource.getRepository(Task);
  let task = await taskRepo.findOne({
    where: { projectId: projectByCode['PRJ-1'].id, code: 'PRJ-1-T1' },
  });
  if (!task) {
    task = taskRepo.create({
      projectId: projectByCode['PRJ-1'].id,
      code: 'PRJ-1-T1',
      title: 'Antecedente técnico-jurídico de orgánica objetivo',
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
    task.title = 'Antecedente técnico-jurídico de orgánica objetivo';
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
    `[seed] projects ${projectsData.length} fichas (${projectsData.map((p) => p.code).join(', ')}) + task/note`,
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
