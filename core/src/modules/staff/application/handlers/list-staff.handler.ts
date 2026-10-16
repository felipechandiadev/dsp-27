import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListStaffQuery } from '../queries/list-staff.query';
import {
  STAFF_REPOSITORY,
  StaffRepositoryPort,
} from '../ports/staff.repository.port';
import { computeInspectorReadiness } from '../helpers/staff-access';
import { MultimediaService } from '@modules/multimedia/application/multimedia.service';

@QueryHandler(ListStaffQuery)
export class ListStaffHandler implements IQueryHandler<ListStaffQuery> {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly repo: StaffRepositoryPort,
    private readonly multimedia: MultimediaService,
  ) {}

  async execute(query: ListStaffQuery) {
    const rows = await this.repo.listStaff({
      unit: query.unit,
      status: query.status,
      inspectorQuality: query.inspectorQuality,
      ds97Profile: query.ds97Profile,
    });
    const avatars = await this.multimedia.findLatestImagesByEntityIds(
      'staff',
      rows.map((s) => s.id),
    );
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
      avatarAssetId: avatars.get(s.id)?.id ?? null,
      person: s.person
        ? {
            id: s.person.id,
            firstName: s.person.firstName,
            lastName: s.person.lastName,
            documentType: s.person.documentType,
            documentNumber: s.person.documentNumber,
            email: s.person.email,
            phone: s.person.phone,
            address: s.person.address,
            city: s.person.city,
            state: s.person.state,
            maritalStatus: s.person.maritalStatus,
            gender: s.person.gender,
            nationality: s.person.nationality,
            profession: s.person.profession,
          }
        : null,
    }));
  }
}
