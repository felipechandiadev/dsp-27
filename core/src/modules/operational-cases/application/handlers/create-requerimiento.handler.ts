import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateRequerimientoCommand } from '../commands/create-requerimiento.command';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { assertCreateCaseRole } from '../helpers/ops-access';
import { mapRequerimiento } from '../helpers/ops.mapper';
import { RecordCodeService } from '@modules/record-codes/application/record-code.service';

const PRIORITIES = new Set(['P0', 'P1', 'P2', 'P3']);

@CommandHandler(CreateRequerimientoCommand)
export class CreateRequerimientoHandler
  implements ICommandHandler<CreateRequerimientoCommand>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
    private readonly recordCodes: RecordCodeService,
  ) {}

  async execute(cmd: CreateRequerimientoCommand) {
    assertCreateCaseRole(cmd.actorRole);
    const descripcion = cmd.input.descripcion?.trim() ?? '';
    if (!descripcion) {
      throw new BadRequestException('descripcion es requerida');
    }
    const prioridad = cmd.input.prioridad ?? 'P2';
    if (!PRIORITIES.has(prioridad)) {
      throw new BadRequestException('prioridad debe ser P0–P3');
    }

    let incidenciaId: string | null = cmd.input.incidenciaId ?? null;
    if (incidenciaId) {
      const inc = await this.repo.findIncidenciaById(incidenciaId);
      if (!inc) throw new NotFoundException('Incidencia no encontrada');
    }

    const code = await this.recordCodes.next('REQ');
    const row = this.repo.createRequerimiento({
      code,
      status: 'ingresado',
      prioridad,
      descripcion,
      occurredAt: cmd.input.occurredAt
        ? new Date(cmd.input.occurredAt)
        : new Date(),
      lat: cmd.input.lat ?? null,
      lng: cmd.input.lng ?? null,
      locationDescription: cmd.input.locationDescription?.trim() || null,
      areaId: cmd.input.areaId ?? null,
      incidenciaId,
      personaSolicitanteId: cmd.input.personaSolicitanteId ?? null,
    });
    const saved = await this.repo.saveRequerimiento(row);

    if (incidenciaId) {
      const inc = await this.repo.findIncidenciaById(incidenciaId);
      if (inc && !inc.requerimientoId) {
        inc.requerimientoId = saved.id;
        await this.repo.saveIncidencia(inc);
      }
    }

    return mapRequerimiento(saved);
  }
}
