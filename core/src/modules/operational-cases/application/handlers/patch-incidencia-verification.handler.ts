import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PatchIncidenciaVerificationCommand } from '../commands/patch-incidencia-verification.command';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { assertVerifyIncidenciaRole } from '../helpers/ops-access';
import { mapIncidencia } from '../helpers/ops.mapper';
import { attachLocationGeometry } from '../helpers/ops-location.helper';
import { CaseLocationGeometryService } from '../case-location-geometry.service';

const STATUSES = new Set(['sin_verificar', 'verificada', 'descartada']);

@CommandHandler(PatchIncidenciaVerificationCommand)
export class PatchIncidenciaVerificationHandler
  implements ICommandHandler<PatchIncidenciaVerificationCommand>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
    private readonly locationGeom: CaseLocationGeometryService,
  ) {}

  async execute(cmd: PatchIncidenciaVerificationCommand) {
    assertVerifyIncidenciaRole(cmd.actorRole);
    if (!STATUSES.has(cmd.status)) {
      throw new BadRequestException(
        'status debe ser sin_verificar, verificada o descartada',
      );
    }
    const row = await this.repo.findIncidenciaByCode(cmd.code);
    if (!row) throw new NotFoundException('Incidencia no encontrada');
    row.status = cmd.status;
    const saved = await this.repo.saveIncidencia(row);
    const full = await this.repo.findIncidenciaById(saved.id);
    return attachLocationGeometry(
      this.locationGeom,
      'incidencias',
      mapIncidencia(full!),
    );
  }
}
