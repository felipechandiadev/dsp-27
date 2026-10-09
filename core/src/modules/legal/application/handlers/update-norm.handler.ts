import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateNormCommand } from '../commands/update-norm.command';
import {
  LEGAL_REPOSITORY,
  LegalRepositoryPort,
} from '../ports/legal.repository.port';
import { assertLegalWriteRole } from '../helpers/legal-access';
import {
  isLegalNormKind,
  isLegalNormStatus,
} from '@modules/legal/domain/legal-kinds';
import { mapNormListItem } from '../helpers/norm.mapper';

@CommandHandler(UpdateNormCommand)
export class UpdateNormHandler implements ICommandHandler<UpdateNormCommand> {
  constructor(
    @Inject(LEGAL_REPOSITORY)
    private readonly legal: LegalRepositoryPort,
  ) {}

  async execute(cmd: UpdateNormCommand) {
    assertLegalWriteRole(cmd.actorRole);
    const norm = await this.legal.findNormByCode(cmd.code);
    if (!norm) {
      throw new NotFoundException(`Norma no encontrada: ${cmd.code}`);
    }

    const { input } = cmd;
    if (input.kind !== undefined) {
      if (!isLegalNormKind(input.kind)) {
        throw new BadRequestException(`kind inválido: ${input.kind}`);
      }
      norm.kind = input.kind;
    }
    if (input.status !== undefined) {
      if (!isLegalNormStatus(input.status)) {
        throw new BadRequestException(`status inválido: ${input.status}`);
      }
      norm.status = input.status;
    }
    if (input.numberLabel !== undefined) {
      const v = input.numberLabel.trim();
      if (!v) throw new BadRequestException('numberLabel vacío');
      norm.numberLabel = v;
    }
    if (input.shortTitle !== undefined) {
      const v = input.shortTitle.trim();
      if (!v) throw new BadRequestException('shortTitle vacío');
      norm.shortTitle = v;
    }
    if (input.publishedOn !== undefined) {
      norm.publishedOn = input.publishedOn;
    }
    if (input.effectiveOn !== undefined) {
      norm.effectiveOn = input.effectiveOn;
    }
    if (input.summary !== undefined) {
      norm.summary = input.summary?.trim() || null;
    }
    if (input.sortOrder !== undefined) {
      norm.sortOrder = input.sortOrder;
    }

    const saved = await this.legal.saveNorm(norm);
    return mapNormListItem(saved);
  }
}
