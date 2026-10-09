import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetStaffQuery } from '../queries/get-staff.query';
import {
  STAFF_REPOSITORY,
  StaffRepositoryPort,
} from '../ports/staff.repository.port';
import { computeInspectorReadiness } from '../helpers/staff-access';
import { MultimediaService } from '@modules/multimedia/application/multimedia.service';

@QueryHandler(GetStaffQuery)
export class GetStaffHandler implements IQueryHandler<GetStaffQuery> {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly repo: StaffRepositoryPort,
    private readonly multimedia: MultimediaService,
  ) {}

  async execute(query: GetStaffQuery) {
    const s = await this.repo.findByCode(query.code);
    if (!s) throw new NotFoundException(`Staff ${query.code} no encontrado`);

    const requirements = [...(s.requirements ?? [])].sort((a, b) =>
      a.requirementCode.localeCompare(b.requirementCode),
    );

    const userId = await this.repo.findUserIdByPersonaId(s.personaId);
    const [tasks, activity, avatar] = await Promise.all([
      this.repo.listAssignedTasks(s.id, s.personaId),
      this.repo.listActivity(s.id, s.personaId, userId),
      this.multimedia.findLatestImage('staff', s.id),
    ]);

    return {
      id: s.id,
      code: s.code,
      unit: s.unit,
      ds97Profile: s.ds97Profile,
      inspectorQualityStatus: s.inspectorQualityStatus,
      appointmentAt: s.appointmentAt,
      priorToLaw: s.priorToLaw,
      employeeNumber: s.employeeNumber,
      workEmail: s.workEmail,
      status: s.status,
      readyForGrant: computeInspectorReadiness(requirements),
      avatarAssetId: avatar?.id ?? null,
      person: s.person
        ? {
            id: s.person.id,
            firstName: s.person.firstName,
            lastName: s.person.lastName,
            documentType: s.person.documentType,
            documentNumber: s.person.documentNumber,
            email: s.person.email,
            phone: s.person.phone,
          }
        : null,
      requirements: requirements.map((r) => ({
        id: r.id,
        requirementCode: r.requirementCode,
        status: r.status,
        notes: r.notes,
      })),
      tasks: tasks.map((t) => ({
        taskId: t.taskId,
        taskCode: t.taskCode,
        title: t.title,
        status: t.status,
        projectCode: t.projectCode,
        projectTitle: t.projectTitle,
        assignmentRole: t.assignmentRole,
        assignedAt: t.assignedAt,
      })),
      activity: activity.map((a) => ({
        kind: a.kind,
        at: a.at,
        summary: a.summary,
        entityType: a.entityType,
        entityId: a.entityId,
        taskCode: a.taskCode,
        projectCode: a.projectCode,
      })),
    };
  }
}
