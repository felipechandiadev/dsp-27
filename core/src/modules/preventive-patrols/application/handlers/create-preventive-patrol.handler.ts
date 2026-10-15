import { BadRequestException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePreventivePatrolCommand } from '../commands/create-preventive-patrol.command';
import {
  PREVENTIVE_PATROLS_REPOSITORY,
  PreventivePatrolsRepositoryPort,
} from '../ports/preventive-patrols.repository.port';
import { assertPpvWriteRole } from '../helpers/ppv-access';
import { mapPreventivePatrol } from '../helpers/ppv.mapper';
import { RecordCodeService } from '@modules/record-codes/application/record-code.service';

@CommandHandler(CreatePreventivePatrolCommand)
export class CreatePreventivePatrolHandler
  implements ICommandHandler<CreatePreventivePatrolCommand>
{
  constructor(
    @Inject(PREVENTIVE_PATROLS_REPOSITORY)
    private readonly repo: PreventivePatrolsRepositoryPort,
    private readonly recordCodes: RecordCodeService,
  ) {}

  async execute(cmd: CreatePreventivePatrolCommand) {
    assertPpvWriteRole(cmd.actorRole);
    if (!cmd.payload || typeof cmd.payload !== 'object') {
      throw new BadRequestException('payload es requerido');
    }
    const code = await this.recordCodes.next('PPV');
    const payload = {
      ...cmd.payload,
      detalles_documento: {
        ...((cmd.payload.detalles_documento as object) ?? {}),
        folio_n: code,
        codigo: 'PPV-01',
      },
    };
    const row = this.repo.create({
      code,
      status: 'registrada',
      payload,
      createdByUserId: cmd.actorUserId,
    });
    const saved = await this.repo.save(row);
    return mapPreventivePatrol(saved);
  }
}
