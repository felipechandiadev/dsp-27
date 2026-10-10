import {
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAreaTypeCommand } from '../commands/create-area-type.command';
import {
  TERRITORY_REPOSITORY,
  TerritoryRepositoryPort,
} from '../ports/territory.repository.port';
import { assertTerritoryWriteRole } from '../helpers/territory-access';
import { mapAreaType } from '../helpers/area.mapper';

const STATUSES = new Set(['active', 'inactive']);

@CommandHandler(CreateAreaTypeCommand)
export class CreateAreaTypeHandler
  implements ICommandHandler<CreateAreaTypeCommand>
{
  constructor(
    @Inject(TERRITORY_REPOSITORY)
    private readonly repo: TerritoryRepositoryPort,
  ) {}

  async execute(cmd: CreateAreaTypeCommand) {
    assertTerritoryWriteRole(cmd.actorRole);
    const code = cmd.input.code?.trim().toLowerCase().replace(/\s+/g, '_') ?? '';
    const name = cmd.input.name?.trim() ?? '';
    if (code.length < 2) {
      throw new BadRequestException('code inválido');
    }
    if (!name) {
      throw new BadRequestException('name es requerido');
    }
    const status = cmd.input.status ?? 'active';
    if (!STATUSES.has(status)) {
      throw new BadRequestException('status debe ser active o inactive');
    }
    const existing = await this.repo.findTypeByCode(code);
    if (existing) {
      throw new ConflictException(`Ya existe el tipo ${code}`);
    }
    const row = this.repo.createType({
      code,
      name,
      description: cmd.input.description?.trim() || null,
      color: cmd.input.color?.trim() || null,
      sortOrder: cmd.input.sortOrder ?? 0,
      status,
    });
    const saved = await this.repo.saveType(row);
    return mapAreaType(saved);
  }
}
