import { BadRequestException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateIncidentTypeCommand } from '../commands/create-incident-type.command';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { assertCreateCaseRole } from '../helpers/ops-access';
import { mapIncidentType } from '../helpers/ops.mapper';
import { RecordCodeService } from '@modules/record-codes/application/record-code.service';

@CommandHandler(CreateIncidentTypeCommand)
export class CreateIncidentTypeHandler
  implements ICommandHandler<CreateIncidentTypeCommand>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
    private readonly recordCodes: RecordCodeService,
  ) {}

  async execute(cmd: CreateIncidentTypeCommand) {
    assertCreateCaseRole(cmd.actorRole);
    const name = cmd.input.name?.trim() ?? '';
    if (!name) {
      throw new BadRequestException('name es requerido');
    }
    const code = await this.recordCodes.next('ITY');
    const row = this.repo.createIncidentType({
      code,
      name,
      sortOrder: cmd.input.sortOrder ?? 0,
      status: 'active',
    });
    const saved = await this.repo.saveIncidentType(row);
    return mapIncidentType(saved);
  }
}
