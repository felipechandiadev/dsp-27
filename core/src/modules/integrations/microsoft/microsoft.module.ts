import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '@config/config.module';
import { AppConfigService } from '@config/config.service';
import { UserOauthAccount } from './domain/user-oauth-account.entity';
import { MicrosoftController } from './presentation/microsoft.controller';
import { OAUTH_ACCOUNT_REPOSITORY } from './application/ports/oauth-account.repository.port';
import { MICROSOFT_OAUTH } from './application/ports/microsoft-oauth.port';
import { MICROSOFT_GRAPH } from './application/ports/microsoft-graph.port';
import { TOKEN_CRYPTO } from './application/ports/token-crypto.port';
import { TypeOrmOauthAccountRepository } from './infrastructure/typeorm-oauth-account.repository';
import { MsalMicrosoftOauth } from './infrastructure/msal-microsoft-oauth';
import { GraphMicrosoftClient } from './infrastructure/graph-microsoft-client';
import { AesTokenCrypto } from './infrastructure/aes-token-crypto';
import { MicrosoftTokenService } from './application/microsoft-token.service';
import { GetMicrosoftStatusHandler } from './application/handlers/get-microsoft-status.handler';
import { GetAuthorizeUrlHandler } from './application/handlers/get-authorize-url.handler';
import { HandleMicrosoftCallbackHandler } from './application/handlers/handle-microsoft-callback.handler';
import { DisconnectMicrosoftHandler } from './application/handlers/disconnect-microsoft.handler';
import { ListInboxHandler } from './application/handlers/list-inbox.handler';
import { ListCalendarEventsHandler } from './application/handlers/list-calendar-events.handler';
import { SendMailHandler } from './application/handlers/send-mail.handler';

@Module({
  imports: [
    CqrsModule,
    AppConfigModule,
    TypeOrmModule.forFeature([UserOauthAccount]),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: '10m' },
      }),
    }),
  ],
  controllers: [MicrosoftController],
  providers: [
    { provide: OAUTH_ACCOUNT_REPOSITORY, useClass: TypeOrmOauthAccountRepository },
    { provide: MICROSOFT_OAUTH, useClass: MsalMicrosoftOauth },
    { provide: MICROSOFT_GRAPH, useClass: GraphMicrosoftClient },
    { provide: TOKEN_CRYPTO, useClass: AesTokenCrypto },
    MicrosoftTokenService,
    GetMicrosoftStatusHandler,
    GetAuthorizeUrlHandler,
    HandleMicrosoftCallbackHandler,
    DisconnectMicrosoftHandler,
    ListInboxHandler,
    ListCalendarEventsHandler,
    SendMailHandler,
  ],
  exports: [MicrosoftTokenService, MICROSOFT_GRAPH, OAUTH_ACCOUNT_REPOSITORY],
})
export class MicrosoftModule {}
