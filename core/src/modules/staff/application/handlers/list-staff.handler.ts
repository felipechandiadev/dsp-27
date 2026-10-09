import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListStaffQuery } from '../queries/list-staff.query';
import {
  STAFF_REPOSITORY,
  StaffRepositoryPort,
} from '../ports/staff.repository.port';
import { computeInspectorReadiness } from '../helpers/staff-access';

@QueryHandler(ListStaffQuery)
export class ListStaffHandler implements IQueryHandler<ListStaffQuery> {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly repo: StaffRepositoryPort,
  ) {}

  async execute(query: ListStaffQuery) {
    const rows = await this.repo.listStaff({
      unit: query.unit,
      status: query.status,
      inspectorQuality: query.inspectorQuality,
      ds97Profile: query.ds97Profile,
    });
    return rows.map((s) => ({
      id: s.id,
      code: s.code,
      unit: s.unit,
      ds97Profile: s.ds97Profile,
      inspectorQualityStatus: s.inspectorQualityStatus,
      status: s.status,
      appointmentAt: s.appointmentAt,
      employeeNumber: s.employeeNumber,
      readyForGrant: computeInspectorReadiness(s.requirements ?? []),
      person: s.person
        ? {
            id: s.person.id,
            firstName: s.person.firstName,
            lastName: s.person.lastName,
            documentType: s.person.documentType,
            documentNumber: s.person.documentNumber,
            email: s.person.email,
          }
        : null,
    }));
  }
}
