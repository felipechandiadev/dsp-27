import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateRequirementCommand } from '../commands/update-requirement.command';
import {
  STAFF_REPOSITORY,
  StaffRepositoryPort,
} from '../ports/staff.repository.port';
import {
  assertStaffWriteRole,
  suggestQualityAfterChecks,
} from '../helpers/staff-access';
import {
  isRequirementCode,
  isRequirementStatus,
} from '@modules/staff/domain/staff-kinds';

@CommandHandler(UpdateRequirementCommand)
export class UpdateRequirementHandler
  implements ICommandHandler<UpdateRequirementCommand>
{
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly repo: StaffRepositoryPort,
  ) {}

  async execute(cmd: UpdateRequirementCommand) {
    assertStaffWriteRole(cmd.actorRole);
    if (!isRequirementCode(cmd.requirementCode)) {
      throw new BadRequestException(
        `requirementCode inválido: ${cmd.requirementCode}`,
      );
    }
    if (!isRequirementStatus(cmd.status)) {
      throw new BadRequestException(`status inválido: ${cmd.status}`);
    }

    const staff = await this.repo.findByCode(cmd.code);
    if (!staff) throw new NotFoundException(`Staff ${cmd.code} no encontrado`);

    const check = await this.repo.findCheck(staff.id, cmd.requirementCode);
    if (!check) {
      throw new NotFoundException(
        `Requisito ${cmd.requirementCode} no encontrado`,
      );
    }

    check.status = cmd.status;
    if (cmd.notes !== undefined) check.notes = cmd.notes;
    await this.repo.saveCheck(check);

    const refreshed = await this.repo.findByCode(cmd.code);
    if (refreshed) {
      const next = suggestQualityAfterChecks(
        refreshed.requirements ?? [],
        refreshed.inspectorQualityStatus,
      );
      if (next !== refreshed.inspectorQualityStatus) {
        refreshed.inspectorQualityStatus = next;
        await this.repo.saveStaff(refreshed);
      }
    }

    return {
      requirementCode: check.requirementCode,
      status: check.status,
      inspectorQualityStatus: refreshed?.inspectorQualityStatus,
    };
  }
}
