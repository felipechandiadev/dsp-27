import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloseRequerimientoCommand } from '../commands/close-requerimiento.command';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { assertCloseRequerimientoRole } from '../helpers/ops-access';
import { mapRequerimiento } from '../helpers/ops.mapper';
import { attachLocationGeometry } from '../helpers/ops-location.helper';
import { CaseLocationGeometryService } from '../case-location-geometry.service';

const CLOSE_STATUSES = new Set(['resuelto', 'no_resuelto', 'descartado']);

@CommandHandler(CloseRequerimientoCommand)
export class CloseRequerimientoHandler
  implements ICommandHandler<CloseRequerimientoCommand>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
    private readonly locationGeom: CaseLocationGeometryService,
  ) {}

  async execute(cmd: CloseRequerimientoCommand) {
    assertCloseRequerimientoRole(cmd.actorRole);
    if (!CLOSE_STATUSES.has(cmd.status)) {
      throw new BadRequestException(
        'status de cierre debe ser resuelto, no_resuelto o descartado',
      );
    }
    const row = await this.repo.findRequerimientoByCode(cmd.code);
    if (!row) throw new NotFoundException('Requerimiento no encontrado');
    row.status = cmd.status;
    row.closedAt = new Date();
    row.closeReason = cmd.reason?.trim() || null;
    const saved = await this.repo.saveRequerimiento(row);
    return attachLocationGeometry(
      this.locationGeom,
      'requerimientos',
      mapRequerimiento(saved),
    );
  }
}
