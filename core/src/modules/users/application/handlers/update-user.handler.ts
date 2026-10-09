import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from '../commands/update-user.command';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../ports/user.repository.port';
import { isUserRole } from '@modules/users/domain/user-roles';
import { mapUserAdminDto } from '../helpers/user-admin.mapper';

const STATUSES = new Set(['active', 'inactive']);

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(cmd: UpdateUserCommand) {
    const user = await this.users.findByIdWithPerson(cmd.userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { input } = cmd;
    if (input.role !== undefined) {
      if (!isUserRole(input.role)) {
        throw new BadRequestException(`role inválido: ${input.role}`);
      }
      user.role = input.role;
    }
    if (input.status !== undefined) {
      if (!STATUSES.has(input.status)) {
        throw new BadRequestException(
          'status debe ser active o inactive',
        );
      }
      user.status = input.status;
    }

    if (user.person) {
      if (input.firstName !== undefined) {
        user.person.firstName = input.firstName.trim();
      }
      if (input.lastName !== undefined) {
        user.person.lastName = input.lastName.trim();
      }
      if (input.email !== undefined) {
        user.person.email = input.email?.trim() || null;
      }
      await this.users.savePerson(user.person);
    }

    await this.users.save(user);
    const full = await this.users.findByIdWithPerson(user.id);
    return mapUserAdminDto(full!);
  }
}
