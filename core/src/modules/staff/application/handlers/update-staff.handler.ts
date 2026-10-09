import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateStaffCommand } from '../commands/update-staff.command';
import {
  STAFF_REPOSITORY,
  StaffRepositoryPort,
} from '../ports/staff.repository.port';
import {
  assertStaffWriteRole,
  computeInspectorReadiness,
} from '../helpers/staff-access';
import {
  isDs97Profile,
  isInspectorQualityStatus,
  isStaffStatus,
  isStaffUnit,
} from '@modules/staff/domain/staff-kinds';

@CommandHandler(UpdateStaffCommand)
export class UpdateStaffHandler
  implements ICommandHandler<UpdateStaffCommand>
{
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly repo: StaffRepositoryPort,
  ) {}

  async execute(cmd: UpdateStaffCommand) {
    assertStaffWriteRole(cmd.actorRole);
    const staff = await this.repo.findByCode(cmd.code);
    if (!staff) throw new NotFoundException(`Staff ${cmd.code} no encontrado`);

    const { input } = cmd;
    if (input.unit != null) {
      if (!isStaffUnit(input.unit)) {
        throw new BadRequestException(`unit inválida: ${input.unit}`);
      }
      staff.unit = input.unit;
    }
    if (input.ds97Profile !== undefined) {
      if (input.ds97Profile != null && !isDs97Profile(input.ds97Profile)) {
        throw new BadRequestException('ds97Profile inválido');
      }
      staff.ds97Profile = input.ds97Profile;
    }
    if (input.status != null) {
      if (!isStaffStatus(input.status)) {
        throw new BadRequestException('status inválido');
      }
      staff.status = input.status;
    }
    if (input.appointmentAt !== undefined) {
      staff.appointmentAt = input.appointmentAt;
    }
    if (input.priorToLaw !== undefined) {
      staff.priorToLaw = input.priorToLaw;
    }
    if (input.employeeNumber !== undefined) {
      staff.employeeNumber = input.employeeNumber;
    }
    if (input.workEmail !== undefined) {
      staff.workEmail = input.workEmail;
    }

    if (input.inspectorQualityStatus != null) {
      if (!isInspectorQualityStatus(input.inspectorQualityStatus)) {
        throw new BadRequestException('inspectorQualityStatus inválido');
      }
      if (input.inspectorQualityStatus === 'granted') {
        const ready = computeInspectorReadiness(staff.requirements ?? []);
        const force =
          input.forceGrant === true && cmd.actorRole === 'direccion';
        if (!ready && !force) {
          throw new BadRequestException(
            'Checklist art. 12° incompleto; dirección puede forzar con forceGrant',
          );
        }
      }
      staff.inspectorQualityStatus = input.inspectorQualityStatus;
    }

    const saved = await this.repo.saveStaff(staff);
    return {
      id: saved.id,
      code: saved.code,
      inspectorQualityStatus: saved.inspectorQualityStatus,
      status: saved.status,
    };
  }
}
