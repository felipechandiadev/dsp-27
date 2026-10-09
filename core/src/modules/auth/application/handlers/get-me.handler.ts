import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMeQuery } from '../queries/get-me.query';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@modules/users/application/ports/user.repository.port';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(query: GetMeQuery) {
    const user = await this.users.findByIdWithPerson(query.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
      personaId: user.personaId,
      person: user.person
        ? {
            id: user.person.id,
            firstName: user.person.firstName,
            lastName: user.person.lastName,
            email: user.person.email,
            documentType: user.person.documentType,
            documentNumber: user.person.documentNumber,
          }
        : null,
    };
  }
}
