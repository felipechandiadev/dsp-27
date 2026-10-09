import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@modules/users/application/ports/user.repository.port';
import { AppConfigService } from '@config/config.service';
import { ListCalendarPeopleQuery } from '../queries/list-calendar-people.query';

@QueryHandler(ListCalendarPeopleQuery)
export class ListCalendarPeopleHandler
  implements IQueryHandler<ListCalendarPeopleQuery>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
    private readonly config: AppConfigService,
  ) {}

  async execute(_query: ListCalendarPeopleQuery) {
    const rows = await this.users.listActiveWithPerson();
    const appOnly = this.config.microsoft.appOnlyCalendar;
    return {
      outlookConfigured: Boolean(
        appOnly && this.config.microsoft.clientId,
      ),
      people: rows.map((u) => {
        const email = u.person?.email?.trim() || null;
        return {
          userId: u.id,
          personaId: u.personaId,
          displayName: u.person
            ? `${u.person.firstName} ${u.person.lastName}`.trim()
            : u.username,
          email,
          outlookEligible: Boolean(email),
        };
      }),
    };
  }
}
