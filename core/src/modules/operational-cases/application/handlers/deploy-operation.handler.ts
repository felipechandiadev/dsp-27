import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeployOperationCommand } from '../commands/deploy-operation.command';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { assertDeployOperationRole } from '../helpers/ops-access';
import { mapFieldOperation } from '../helpers/ops.mapper';
import { RecordCodeService } from '@modules/record-codes/application/record-code.service';

const TRIGGERS = new Set([
  'requerimiento',
  'incidencia',
  'leadership_instruction',
]);
const PRIORITIES = new Set(['P0', 'P1', 'P2', 'P3']);

@CommandHandler(DeployOperationCommand)
export class DeployOperationHandler
  implements ICommandHandler<DeployOperationCommand>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
    private readonly recordCodes: RecordCodeService,
  ) {}

  async execute(cmd: DeployOperationCommand) {
    assertDeployOperationRole(cmd.actorRole);
    const { input } = cmd;
    if (!TRIGGERS.has(input.triggerType)) {
      throw new BadRequestException('triggerType inválido');
    }
    const prioridad = input.prioridad ?? 'P2';
    if (!PRIORITIES.has(prioridad)) {
      throw new BadRequestException('prioridad debe ser P0–P3');
    }

    if (input.triggerType === 'requerimiento') {
      if (!input.requerimientoId) {
        throw new BadRequestException('requerimientoId es requerido');
      }
      const req = await this.repo.findRequerimientoById(input.requerimientoId);
      if (!req) throw new NotFoundException('Requerimiento no encontrado');
    }
    if (input.triggerType === 'incidencia') {
      if (!input.incidenciaId) {
        throw new BadRequestException('incidenciaId es requerido');
      }
      const inc = await this.repo.findIncidenciaById(input.incidenciaId);
      if (!inc) throw new NotFoundException('Incidencia no encontrada');
    }
    if (
      input.triggerType === 'leadership_instruction' &&
      !input.requerimientoId &&
      !input.incidenciaId
    ) {
      // allowed without links
    }

    if (input.operationTypeId) {
      const t = await this.repo.findOperationTypeById(input.operationTypeId);
      if (!t || t.status !== 'active') {
        throw new NotFoundException('Tipo de operación no encontrado');
      }
    }

    if (input.requerimientoId) {
      const req = await this.repo.findRequerimientoById(input.requerimientoId);
      if (req && req.status === 'ingresado') {
        req.status = 'en_gestion';
        await this.repo.saveRequerimiento(req);
      }
    }

    const code = await this.recordCodes.next('OPE');
    const row = this.repo.createOperation({
      code,
      status: 'asignada',
      triggerType: input.triggerType,
      prioridad,
      briefing: input.briefing?.trim() || null,
      operationTypeId: input.operationTypeId ?? null,
      requerimientoId: input.requerimientoId ?? null,
      incidenciaId: input.incidenciaId ?? null,
      assignedStaffId: input.assignedStaffId ?? null,
      areaId: input.areaId ?? null,
    });
    const saved = await this.repo.saveOperation(row);
    const full = await this.repo.findOperationById(saved.id);
    return mapFieldOperation(full!);
  }
}
