import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListCalendarEventsQuery } from '../queries/list-calendar-events.query';
import {
  MICROSOFT_GRAPH,
  MicrosoftGraphPort,
} from '../ports/microsoft-graph.port';
import { MicrosoftTokenService } from '../microsoft-token.service';

@QueryHandler(ListCalendarEventsQuery)
export class ListCalendarEventsHandler
  implements IQueryHandler<ListCalendarEventsQuery>
{
  constructor(
    private readonly tokens: MicrosoftTokenService,
    @Inject(MICROSOFT_GRAPH)
    private readonly graph: MicrosoftGraphPort,
  ) {}

  async execute(query: ListCalendarEventsQuery) {
    const accessToken = await this.tokens.getValidAccessToken(query.userId);
    const events = await this.graph.listEvents(accessToken, query.top);
    return { events };
  }
}
