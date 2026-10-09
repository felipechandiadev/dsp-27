import {
  BadRequestException,
  ConflictException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcryptjs';
import { CreateUserCommand } from '../commands/create-user.command';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../ports/user.repository.port';
import { isUserRole } from '@modules/users/domain/user-roles';
import { mapUserAdminDto } from '../helpers/user-admin.mapper';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(cmd: CreateUserCommand) {
    const { input } = cmd;
    const username = input.username?.trim().toLowerCase() ?? '';
    const password = input.password?.trim() ?? '';

    if (!username || username.length < 3) {
      throw new BadRequestException('username debe tener al menos 3 caracteres');
    }
    if (password.length < 8) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 8 caracteres',
      );
    }
    if (!isUserRole(input.role)) {
      throw new BadRequestException(`role inválido: ${input.role}`);
    }

    const existing = await this.users.findByUsernameAny(username);
    if (existing) {
      throw new ConflictException(`Ya existe el usuario ${username}`);
    }

    let person =
      input.personaId != null
        ? await this.users.findPersonById(input.personaId)
        : null;

    if (!person) {
      if (
        !input.documentType ||
        !input.documentNumber ||
        !input.firstName ||
        !input.lastName
      ) {
        throw new BadRequestException(
          'Indique personaId o datos de documento y nombre',
        );
      }
      person = await this.users.findPersonByDocument(
        input.documentType,
        input.documentNumber,
      );
      if (!person) {
        person = this.users.createPerson({
          documentType: input.documentType,
          documentNumber: input.documentNumber,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email ?? null,
          phone: input.phone ?? null,
        });
      } else {
        person.firstName = input.firstName;
        person.lastName = input.lastName;
        if (input.email !== undefined) person.email = input.email ?? null;
        if (input.phone !== undefined) person.phone = input.phone ?? null;
      }
      person = await this.users.savePerson(person);
    }
    if (!person) {
      throw new NotFoundException('Persona no encontrada');
    }

    const linked = await this.users.findByPersonaIdAny(person.id);
    if (linked) {
      throw new ConflictException(
        `La persona ya tiene usuario ${linked.username}`,
      );
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(password, rounds);
    const user = this.users.createUser({
      personaId: person.id,
      username,
      passwordHash,
      role: input.role,
      status: 'active',
    });
    const saved = await this.users.save(user);
    const full = await this.users.findByIdWithPerson(saved.id);
    return mapUserAdminDto(full!);
  }
}
