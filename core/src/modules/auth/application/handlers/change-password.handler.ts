import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordCommand } from '../commands/change-password.command';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@modules/users/application/ports/user.repository.port';

@Injectable()
@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler
  implements ICommandHandler<ChangePasswordCommand>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(command: ChangePasswordCommand) {
    const current = command.currentPassword?.trim() ?? '';
    const next = command.newPassword?.trim() ?? '';
    if (next.length < 8) {
      throw new BadRequestException(
        'La nueva contraseña debe tener al menos 8 caracteres',
      );
    }
    if (current === next) {
      throw new BadRequestException(
        'La nueva contraseña debe ser distinta a la actual',
      );
    }

    const user = await this.users.findByIdWithPerson(command.userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const ok = await bcrypt.compare(current, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(next, rounds);
    await this.users.updatePasswordHash(user.id, passwordHash);

    return { ok: true };
  }
}
