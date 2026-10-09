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
  const gestorPass =
    process.env.DSP_SEED_GESTOR_PASSWORD || `${adminPass || 'direccion123'}-gestor`;
  const prevPass =
    process.env.DSP_SEED_PREVENCION_PASSWORD ||
    `${adminPass || 'direccion123'}-prevencion`;

  if (!adminPass) {
    throw new Error('DSP_SEED_ADMIN_PASSWORD is required in core/.env');
  }

  await AppDataSource.initialize();
  console.log('[seed] connected');

  // --- Identity ---
  const dirPerson = await upsertPerson({
    documentType: 'RUT',
    documentNumber: '11.111.111-1',
    firstName: 'Dirección',
    lastName: 'DSP Parral',
    email: adminEmail,
    code: 'P-DIR',
  });
  const direccion = await upsertUser({
    personaId: dirPerson.id,
    username: adminUser,
    password: adminPass,
    role: 'direccion',
  });

  const gestorPerson = await upsertPerson({
    documentType: 'RUT',
    documentNumber: '22.222.222-2',
    firstName: 'Gestor',
    lastName: 'Territorial',
    email: 'gestor@dsp.local',
    code: 'P-GES',
  });
  await upsertUser({
    personaId: gestorPerson.id,
    username: 'gestor',
    password: gestorPass,
    role: 'gestor',
  });

  const prevPerson = await upsertPerson({
    documentType: 'RUT',
    documentNumber: '33.333.333-3',
    firstName: 'Prevención',
    lastName: 'Comunitaria',
    email: 'prevencion@dsp.local',
    code: 'P-PRE',
  });
  await upsertUser({
    personaId: prevPerson.id,
    username: 'prevencion',
    password: prevPass,
    role: 'prevencion',
  });

  console.log('[seed] users:', adminUser, 'gestor', 'prevencion');

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

  // --- Portfolio ---
  const projectRepo = AppDataSource.getRepository(Project);
  const projectsData = [
    {
      code: 'PRJ-1',
      kind: 'project',
      title: 'Actualización orgánica DSP',
      leadRole: 'direccion',
      summary:
        'Dictar y dejar vigente un decreto que actualice el Reglamento orgánico municipal con la orgánica objetivo.',
      problem:
        'El Reglamento vigente reconoce solo Depto. 13.1 y 13.2; no contempla unidades de apoyo ni inspectores de seguridad municipal.',
      scope:
        'Actualización Art. 26 y traslado de gestión técnico-contractual de parquímetros (Art. 25° r)).',
      objectiveCodes: ['O1'],
    },
    {
      code: 'PRJ-5',
      kind: 'project',
      title: 'Traslado Central de cámaras',
      leadRole: 'analisis_sistemas',
      summary:
        'Trasladar la Central a un inmueble municipal dimensionado, con continuidad de monitoreo.',
      problem:
        'La Central opera en la Tercera Comisaría; el espacio no alcanza con la ampliación de televigilancia.',
      scope: 'Inventario, ET/bases, traslado y custodia de imágenes.',
      objectiveCodes: ['O1', 'O4'],
    },
    {
      code: 'TAR-3',
      kind: 'portfolio_task',
      title: 'Otorgamiento calidad de inspector/a',
      leadRole: 'direccion',
      summary:
        'Otorgar la calidad, definir dotación, capacitar y cumplir nómina y registro legales (arts. 11–15).',
      problem:
        'La calidad de inspector/a de seguridad municipal no ha sido otorgada.',
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
    if (!row) {
      row = projectRepo.create({
        code: p.code,
        kind: p.kind,
        title: p.title,
        status: 'in_progress',
        leadRole: p.leadRole,
        summary: p.summary,
        problem: p.problem,
        scope: p.scope,
        strategicObjectives: objectives,
        startsOn: '2027-01-01',
        endsOn: '2027-12-31',
      });
    } else {
      row.title = p.title;
      row.kind = p.kind;
      row.leadRole = p.leadRole;
      row.summary = p.summary;
      row.problem = p.problem;
      row.scope = p.scope;
      row.strategicObjectives = objectives;
      row.status = row.status || 'in_progress';
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
        authorUserId: direccion.id,
      }),
    );
  }

  console.log('[seed] projects PRJ-1, PRJ-5, TAR-3 + task/note');
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
