import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcryptjs';
import { ResetUserPasswordCommand } from '../commands/reset-user-password.command';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../ports/user.repository.port';

@CommandHandler(ResetUserPasswordCommand)
export class ResetUserPasswordHandler
  implements ICommandHandler<ResetUserPasswordCommand>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(cmd: ResetUserPasswordCommand) {
    const next = cmd.newPassword?.trim() ?? '';
    if (next.length < 8) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 8 caracteres',
      );
    }

    const user = await this.users.findByIdWithPerson(cmd.userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(next, rounds);
    await this.users.updatePasswordHash(user.id, passwordHash);

    return { ok: true };
  }
}
