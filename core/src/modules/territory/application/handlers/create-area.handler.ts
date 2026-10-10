import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { CreateAreaCommand } from '../commands/create-area.command';
import {
  TERRITORY_REPOSITORY,
  TerritoryRepositoryPort,
} from '../ports/territory.repository.port';
import { assertTerritoryWriteRole } from '../helpers/territory-access';
import { OperationAreaGeometryService } from '../operation-area-geometry.service';
import { RecordCodeService } from '@modules/record-codes/application/record-code.service';
import { mapArea } from '../helpers/area.mapper';

const STATUSES = new Set(['active', 'inactive']);

@CommandHandler(CreateAreaCommand)
export class CreateAreaHandler implements ICommandHandler<CreateAreaCommand> {
  constructor(
    @Inject(TERRITORY_REPOSITORY)
    private readonly repo: TerritoryRepositoryPort,
    private readonly geometry: OperationAreaGeometryService,
    private readonly recordCodes: RecordCodeService,
  ) {}

  async execute(cmd: CreateAreaCommand) {
    assertTerritoryWriteRole(cmd.actorRole);
    const { input } = cmd;
    const name = input.name?.trim() ?? '';
    if (!name) throw new BadRequestException('name es requerido');
    if (!input.geometry) {
      throw new BadRequestException('geometry es requerido');
    }
    this.geometry.validatePolygon(input.geometry);

    const type = await this.repo.findTypeById(input.typeId);
    if (!type || type.status !== 'active') {
      throw new NotFoundException('Tipo de área no encontrado o inactivo');
    }
    if (input.parentId) {
      const parent = await this.repo.findAreaById(input.parentId);
      if (!parent) {
        throw new NotFoundException('Área padre no encontrada');
      }
    }
    const status = input.status ?? 'active';
    if (!STATUSES.has(status)) {
      throw new BadRequestException('status debe ser active o inactive');
    }

    const id = randomUUID();
    const code = await this.recordCodes.next('AOP');
    await this.geometry.insertWithGeometry({
      id,
      code,
      name,
      typeId: type.id,
      parentId: input.parentId ?? null,
      status,
      notes: input.notes?.trim() || null,
      geometry: input.geometry,
    });

    const saved = await this.repo.findAreaById(id);
    if (!saved) {
      throw new BadRequestException('No se pudo crear el área');
    }
    const geom = await this.geometry.readGeometry(id);
    return mapArea(saved, geom);
  }
}
