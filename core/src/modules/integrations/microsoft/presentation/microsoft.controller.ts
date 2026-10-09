import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUser } from '@modules/auth/domain/jwt-payload';
import { GetMicrosoftStatusQuery } from '../application/queries/get-microsoft-status.query';
import { GetAuthorizeUrlQuery } from '../application/queries/get-authorize-url.query';
import { HandleMicrosoftCallbackCommand } from '../application/commands/handle-microsoft-callback.command';
import { DisconnectMicrosoftCommand } from '../application/commands/disconnect-microsoft.command';
import { ListInboxQuery } from '../application/queries/list-inbox.query';
import { ListCalendarEventsQuery } from '../application/queries/list-calendar-events.query';
import { SendMailCommand } from '../application/commands/send-mail.command';
import { SendMailDto } from './dto/send-mail.dto';

@ApiTags('integrations-microsoft')
@Controller('integrations/microsoft')
export class MicrosoftController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  status(@CurrentUser() user: AuthUser) {
    return this.queryBus.execute(new GetMicrosoftStatusQuery(user.id));
  }

  /** Returns { url } for the Next BFF to redirect the browser. */
  @Get('authorize-url')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  authorizeUrl(@CurrentUser() user: AuthUser) {
    return this.queryBus.execute(new GetAuthorizeUrlQuery(user.id));
  }

  @Get('callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.commandBus.execute(
      new HandleMicrosoftCallbackCommand(code, state, error),
    );
    return res.redirect(String(redirectUrl));
  }

  @Delete()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  disconnect(@CurrentUser() user: AuthUser) {
    return this.commandBus.execute(new DisconnectMicrosoftCommand(user.id));
  }

  @Get('mail/inbox')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  inbox(
    @CurrentUser() user: AuthUser,
    @Query('top') top?: string,
  ) {
    const n = Math.min(Math.max(parseInt(top || '20', 10) || 20, 1), 50);
    return this.queryBus.execute(new ListInboxQuery(user.id, n));
  }

  @Post('mail/send')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  sendMail(@CurrentUser() user: AuthUser, @Body() dto: SendMailDto) {
    return this.commandBus.execute(
      new SendMailCommand(user.id, dto.to, dto.subject, dto.bodyHtml),
    );
  }

  @Get('calendar/events')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  events(
    @CurrentUser() user: AuthUser,
    @Query('top') top?: string,
  ) {
    const n = Math.min(Math.max(parseInt(top || '20', 10) || 20, 1), 50);
    return this.queryBus.execute(new ListCalendarEventsQuery(user.id, n));
  }
}
