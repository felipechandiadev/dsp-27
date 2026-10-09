import {
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { GetAuthorizeUrlQuery } from '../queries/get-authorize-url.query';
import {
  MICROSOFT_OAUTH,
  MicrosoftOauthPort,
} from '../ports/microsoft-oauth.port';

@QueryHandler(GetAuthorizeUrlQuery)
export class GetAuthorizeUrlHandler
  implements IQueryHandler<GetAuthorizeUrlQuery>
{
  constructor(
    @Inject(MICROSOFT_OAUTH)
    private readonly oauth: MicrosoftOauthPort,
    private readonly jwt: JwtService,
  ) {}

  async execute(query: GetAuthorizeUrlQuery) {
    if (!this.oauth.isConfigured()) {
      throw new ServiceUnavailableException(
        'Integración Microsoft no configurada',
      );
    }
    const state = await this.jwt.signAsync(
      { sub: query.userId, purpose: 'ms-oauth' },
      { expiresIn: '10m' },
    );
    return { url: this.oauth.getAuthorizationUrl(state) };
  }
}
