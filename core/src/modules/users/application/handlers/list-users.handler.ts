import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListUsersQuery } from '../queries/list-users.query';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../ports/user.repository.port';
import { mapUserAdminDto } from '../helpers/user-admin.mapper';

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(query: ListUsersQuery) {
    const all = await this.users.listAllWithPerson();
    const filtered =
      query.status != null && query.status !== ''
        ? all.filter((u) => u.status === query.status)
        : all;
    return filtered.map(mapUserAdminDto);
  }
}
