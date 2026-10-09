import {
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateNormCommand } from '../commands/create-norm.command';
import {
  LEGAL_REPOSITORY,
  LegalRepositoryPort,
} from '../ports/legal.repository.port';
import { assertLegalWriteRole } from '../helpers/legal-access';
import {
  deriveNormCode,
  isLegalNormKind,
  isLegalNormStatus,
} from '@modules/legal/domain/legal-kinds';
import { mapNormListItem } from '../helpers/norm.mapper';

@CommandHandler(CreateNormCommand)
export class CreateNormHandler implements ICommandHandler<CreateNormCommand> {
  constructor(
    @Inject(LEGAL_REPOSITORY)
    private readonly legal: LegalRepositoryPort,
  ) {}

  async execute(cmd: CreateNormCommand) {
    assertLegalWriteRole(cmd.actorRole);
    const { input } = cmd;

    if (!isLegalNormKind(input.kind)) {
      throw new BadRequestException(`kind inválido: ${input.kind}`);
    }
    const status = input.status ?? 'in_force';
    if (!isLegalNormStatus(status)) {
      throw new BadRequestException(`status inválido: ${status}`);
    }
    const numberLabel = input.numberLabel?.trim() ?? '';
    const shortTitle = input.shortTitle?.trim() ?? '';
    if (!numberLabel || !shortTitle) {
      throw new BadRequestException(
        'numberLabel y shortTitle son requeridos',
      );
    }

    let code = (input.code?.trim() || deriveNormCode(input.kind, numberLabel))
      .toUpperCase()
      .replace(/\s+/g, '-');
    if (code.length < 3) {
      throw new BadRequestException('code inválido');
    }

    const existing = await this.legal.findNormByCode(code);
    if (existing) {
      if (input.code?.trim()) {
        throw new ConflictException(`Ya existe la norma ${code}`);
      }
      // Colisión del code derivado: sufijo numérico
      let n = 2;
      while (await this.legal.findNormByCode(`${code}-${n}`)) {
        n += 1;
        if (n > 99) {
          throw new ConflictException('No se pudo generar code único');
        }
      }
      code = `${code}-${n}`;
    }

    const norm = this.legal.createNorm({
      code,
      kind: input.kind,
      numberLabel,
      shortTitle,
      status,
      publishedOn: input.publishedOn ?? null,
      effectiveOn: input.effectiveOn ?? null,
      summary: input.summary?.trim() || null,
      sortOrder: input.sortOrder ?? 0,
    });
    const saved = await this.legal.saveNorm(norm);
    return mapNormListItem(saved);
  }
}
