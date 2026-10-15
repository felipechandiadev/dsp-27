import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PatchRequerimientoStatusCommand } from '../commands/patch-requerimiento-status.command';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { assertCloseRequerimientoRole } from '../helpers/ops-access';
import { mapRequerimiento } from '../helpers/ops.mapper';
import { attachLocationGeometry } from '../helpers/ops-location.helper';
import { CaseLocationGeometryService } from '../case-location-geometry.service';

@CommandHandler(PatchRequerimientoStatusCommand)
export class PatchRequerimientoStatusHandler
  implements ICommandHandler<PatchRequerimientoStatusCommand>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
    private readonly locationGeom: CaseLocationGeometryService,
  ) {}

  async execute(cmd: PatchRequerimientoStatusCommand) {
    assertCloseRequerimientoRole(cmd.actorRole);
    if (cmd.status !== 'en_gestion' && cmd.status !== 'ingresado') {
      throw new BadRequestException(
        'Use close para estados terminales; aquí solo ingresado|en_gestion',
      );
    }
    const row = await this.repo.findRequerimientoByCode(cmd.code);
    if (!row) throw new NotFoundException('Requerimiento no encontrado');
    if (row.closedAt) {
      throw new BadRequestException('Requerimiento ya cerrado');
    }
    row.status = cmd.status;
    const saved = await this.repo.saveRequerimiento(row);
    return attachLocationGeometry(
      this.locationGeom,
      'requerimientos',
      mapRequerimiento(saved),
    );
  }
}
