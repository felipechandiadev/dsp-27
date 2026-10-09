import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Person } from '@modules/persons/domain/person.entity';
import { User } from '@modules/users/domain/user.entity';
import { Task } from '@modules/portfolio/domain/task.entity';
import { TaskAssignee } from '@modules/portfolio/domain/task-assignee.entity';
import { WorkNote } from '@modules/portfolio/domain/work-note.entity';
import { Project } from '@modules/portfolio/domain/project.entity';
import { StaffMember } from '../domain/staff-member.entity';
import { StaffRequirementCheck } from '../domain/staff-requirement-check.entity';
import {
  StaffActivityRow,
  StaffAssignedTaskRow,
  StaffRepositoryPort,
} from '../application/ports/staff.repository.port';

@Injectable()
export class TypeOrmStaffRepository implements StaffRepositoryPort {
  constructor(
    @InjectRepository(Person)
    private readonly persons: Repository<Person>,
    @InjectRepository(StaffMember)
    private readonly staff: Repository<StaffMember>,
    @InjectRepository(StaffRequirementCheck)
    private readonly checks: Repository<StaffRequirementCheck>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(TaskAssignee)
    private readonly assignees: Repository<TaskAssignee>,
    @InjectRepository(Task)
    private readonly tasks: Repository<Task>,
    @InjectRepository(WorkNote)
    private readonly notes: Repository<WorkNote>,
  ) {}

  listStaff(filters?: {
    unit?: string;
    status?: string;
    inspectorQuality?: string;
    ds97Profile?: string;
  }): Promise<StaffMember[]> {
    const where: Record<string, string> = {};
    if (filters?.unit) where.unit = filters.unit;
    if (filters?.status) where.status = filters.status;
    if (filters?.inspectorQuality) {
      where.inspectorQualityStatus = filters.inspectorQuality;
    }
    if (filters?.ds97Profile) where.ds97Profile = filters.ds97Profile;
    return this.staff.find({
      where,
      relations: ['person', 'requirements'],
      order: { code: 'ASC' },
    });
  }

  findByCode(code: string): Promise<StaffMember | null> {
    return this.staff.findOne({
      where: { code },
      relations: ['person', 'requirements'],
    });
  }

  findByPersonaId(personaId: string): Promise<StaffMember | null> {
    return this.staff.findOne({
      where: { personaId },
      relations: ['person', 'requirements'],
    });
  }

  findPersonById(id: string): Promise<Person | null> {
    return this.persons.findOne({ where: { id } });
  }

  findPersonByDocument(
    documentType: string,
    documentNumber: string,
  ): Promise<Person | null> {
    return this.persons.findOne({ where: { documentType, documentNumber } });
  }

  async findUserIdByPersonaId(personaId: string): Promise<string | null> {
    const user = await this.users.findOne({ where: { personaId } });
    return user?.id ?? null;
  }

  async listAssignedTasks(
    staffId: string,
    personaId: string,
  ): Promise<StaffAssignedTaskRow[]> {
    const rows = await this.assignees
      .createQueryBuilder('a')
      .innerJoin(Task, 't', 't.id = a.task_id')
      .leftJoin(Project, 'p', 'p.id = t.project_id')
      .where('a.unassigned_at IS NULL')
      .andWhere('(a.staff_id = :staffId OR a.person_id = :personaId)', {
        staffId,
        personaId,
      })
      .orderBy('a.assigned_at', 'DESC')
      .select([
        'a.task_id AS "taskId"',
        't.code AS "taskCode"',
        't.title AS "title"',
        't.status AS "status"',
        'p.code AS "projectCode"',
        'p.title AS "projectTitle"',
        'a.assignment_role AS "assignmentRole"',
        'a.assigned_at AS "assignedAt"',
      ])
      .getRawMany<{
        taskId: string;
        taskCode: string | null;
        title: string;
        status: string;
        projectCode: string | null;
        projectTitle: string | null;
        assignmentRole: string;
        assignedAt: Date;
      }>();

    // Dedupe by taskId (prefer staff link already included)
    const seen = new Set<string>();
    const out: StaffAssignedTaskRow[] = [];
    for (const r of rows) {
      if (seen.has(r.taskId)) continue;
      seen.add(r.taskId);
      out.push(r);
    }
    return out;
  }

  async listActivity(
    staffId: string,
    personaId: string,
    userId: string | null,
    limit = 30,
  ): Promise<StaffActivityRow[]> {
    const items: StaffActivityRow[] = [];

    if (userId) {
      const notes = await this.notes.find({
        where: { authorUserId: userId },
        order: { createdAt: 'DESC' },
        take: limit,
      });
      for (const n of notes) {
        let taskCode: string | null = null;
        let projectCode: string | null = null;
        if (n.entityType === 'task') {
          const task = await this.tasks.findOne({
            where: { id: n.entityId },
            relations: ['project'],
          });
          taskCode = task?.code ?? null;
          projectCode = task?.project?.code ?? null;
        }
        items.push({
          kind: 'note',
          at: n.createdAt,
          summary: n.body.length > 160 ? `${n.body.slice(0, 157)}…` : n.body,
          entityType: n.entityType,
          entityId: n.entityId,
          taskCode,
          projectCode,
        });
      }
    }

    const assignees = await this.assignees.find({
      where: [
        { staffId, unassignedAt: IsNull() },
        { personId: personaId, unassignedAt: IsNull() },
      ],
      order: { assignedAt: 'DESC' },
      take: limit,
    });
    const seenAssign = new Set<string>();
    for (const a of assignees) {
      if (!a.taskId || seenAssign.has(a.taskId)) continue;
      seenAssign.add(a.taskId);
      const task = await this.tasks.findOne({
        where: { id: a.taskId },
        relations: ['project'],
      });
      items.push({
        kind: 'assignment',
        at: a.assignedAt,
        summary: `Asignado como ${a.assignmentRole} a «${task?.title ?? a.taskId}»`,
        entityType: 'task',
        entityId: a.taskId,
        taskCode: task?.code ?? null,
        projectCode: task?.project?.code ?? null,
      });
    }

    items.sort((a, b) => b.at.getTime() - a.at.getTime());
    return items.slice(0, limit);
  }

  savePerson(person: Person): Promise<Person> {
    return this.persons.save(person);
  }

  saveStaff(member: StaffMember): Promise<StaffMember> {
    return this.staff.save(member);
  }

  saveChecks(
    rows: StaffRequirementCheck[],
  ): Promise<StaffRequirementCheck[]> {
    return this.checks.save(rows);
  }

  saveCheck(check: StaffRequirementCheck): Promise<StaffRequirementCheck> {
    return this.checks.save(check);
  }

  findCheck(
    staffId: string,
    requirementCode: string,
  ): Promise<StaffRequirementCheck | null> {
    return this.checks.findOne({ where: { staffId, requirementCode } });
  }

  createPerson(data: Partial<Person>): Person {
    return this.persons.create(data);
  }

  createStaff(data: Partial<StaffMember>): StaffMember {
    return this.staff.create(data);
  }

  createCheck(data: Partial<StaffRequirementCheck>): StaffRequirementCheck {
    return this.checks.create(data);
  }
}
