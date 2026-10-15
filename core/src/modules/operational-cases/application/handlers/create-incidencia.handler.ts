import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateIncidenciaCommand } from '../commands/create-incidencia.command';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { assertCreateCaseRole } from '../helpers/ops-access';
import { mapIncidencia } from '../helpers/ops.mapper';
import {
  attachLocationGeometry,
  resolveCreateLocationGeometry,
} from '../helpers/ops-location.helper';
import { CaseLocationGeometryService } from '../case-location-geometry.service';
import { RecordCodeService } from '@modules/record-codes/application/record-code.service';

@CommandHandler(CreateIncidenciaCommand)
export class CreateIncidenciaHandler
  implements ICommandHandler<CreateIncidenciaCommand>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
    private readonly recordCodes: RecordCodeService,
    private readonly locationGeom: CaseLocationGeometryService,
  ) {}

  async execute(cmd: CreateIncidenciaCommand) {
    assertCreateCaseRole(cmd.actorRole);
    const title = cmd.input.title?.trim() ?? '';
    if (!title) throw new BadRequestException('title es requerido');

    if (cmd.input.incidentTypeId) {
      const t = await this.repo.findIncidentTypeById(cmd.input.incidentTypeId);
      if (!t || t.status !== 'active') {
        throw new NotFoundException('Tipo de incidencia no encontrado');
      }
    }
    if (cmd.input.requerimientoId) {
      const req = await this.repo.findRequerimientoById(cmd.input.requerimientoId);
      if (!req) throw new NotFoundException('Requerimiento no encontrado');
    }

    const resolved = resolveCreateLocationGeometry(cmd.input);
    if (resolved) this.locationGeom.validate(resolved);
    const coords = this.locationGeom.coordsFromGeometry(resolved ?? null);

    const code = await this.recordCodes.next('INC');
    const row = this.repo.createIncidencia({
      code,
      title,
      descripcion: cmd.input.descripcion?.trim() || null,
      status: 'sin_verificar',
      incidentTypeId: cmd.input.incidentTypeId ?? null,
      occurredAt: cmd.input.occurredAt
        ? new Date(cmd.input.occurredAt)
        : new Date(),
      lat: coords.lat,
      lng: coords.lng,
      locationDescription: cmd.input.locationDescription?.trim() || null,
      areaId: cmd.input.areaId ?? null,
      requerimientoId: cmd.input.requerimientoId ?? null,
      ingressChannel: cmd.input.ingressChannel?.trim() || 'central',
      registrationOrigin:
        cmd.input.registrationOrigin?.trim() || 'dispatch_entry',
    });
    const saved = await this.repo.saveIncidencia(row);

    if (resolved !== undefined) {
      await this.locationGeom.write('incidencias', saved.id, resolved);
    }

    const full = await this.repo.findIncidenciaById(saved.id);
    return attachLocationGeometry(
      this.locationGeom,
      'incidencias',
      mapIncidencia(full!),
    );
  }
}
