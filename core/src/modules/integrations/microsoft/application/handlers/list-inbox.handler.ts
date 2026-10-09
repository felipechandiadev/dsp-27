import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListInboxQuery } from '../queries/list-inbox.query';
import {
  MICROSOFT_GRAPH,
  MicrosoftGraphPort,
} from '../ports/microsoft-graph.port';
import { MicrosoftTokenService } from '../microsoft-token.service';

@QueryHandler(ListInboxQuery)
export class ListInboxHandler implements IQueryHandler<ListInboxQuery> {
  constructor(
    private readonly tokens: MicrosoftTokenService,
    @Inject(MICROSOFT_GRAPH)
    private readonly graph: MicrosoftGraphPort,
  ) {}

  async execute(query: ListInboxQuery) {
    const accessToken = await this.tokens.getValidAccessToken(query.userId);
    const messages = await this.graph.listInbox(accessToken, query.top);
    return { messages };
  }
}
