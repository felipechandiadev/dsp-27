import { BadRequestException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateContractCommand } from '../commands/create-contract.command';
import {
  CONTRACTS_REPOSITORY,
  ContractsRepositoryPort,
} from '../ports/contracts.repository.port';
import { assertItsOrDireccion } from '../helpers/period-status';
import { isContractKind } from '@modules/contracts/domain/contract-kinds';
import { RecordCodeService } from '@modules/record-codes/application/record-code.service';

@CommandHandler(CreateContractCommand)
export class CreateContractHandler
  implements ICommandHandler<CreateContractCommand>
{
  constructor(
    @Inject(CONTRACTS_REPOSITORY)
    private readonly repo: ContractsRepositoryPort,
    private readonly recordCodes: RecordCodeService,
  ) {}

  async execute(cmd: CreateContractCommand) {
    assertItsOrDireccion(cmd.actorRole);
    const { input } = cmd;
    if (!isContractKind(input.kind)) {
      throw new BadRequestException(`kind inválido: ${input.kind}`);
    }

    const code = await this.recordCodes.next('CTR');

    let contractor = await this.repo.findContractorByRut(input.contractorRut);
    if (!contractor) {
      contractor = this.repo.createContractor({
        rut: input.contractorRut,
        name: input.contractorName,
        email: input.contractorEmail ?? null,
        phone: input.contractorPhone ?? null,
      });
    } else {
      contractor.name = input.contractorName;
      contractor.email = input.contractorEmail ?? contractor.email;
      contractor.phone = input.contractorPhone ?? contractor.phone;
    }
    contractor = await this.repo.saveContractor(contractor);

    const contract = this.repo.createContract({
      code,
      kind: input.kind,
      title: input.title,
      status: input.status ?? 'active',
      contractorId: contractor.id,
      itsUserId: input.itsUserId,
      projectId: input.projectId ?? null,
      startsOn: input.startsOn,
      endsOn: input.endsOn ?? null,
      notes: input.notes ?? null,
    });
    const saved = await this.repo.saveContract(contract);
    return { id: saved.id, code: saved.code };
  }
}
