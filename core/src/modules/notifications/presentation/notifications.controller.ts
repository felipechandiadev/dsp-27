import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUser } from '@modules/auth/domain/jwt-payload';
import { GetInboxQuery } from '../application/queries/get-inbox.query';
import { GetUnreadCountQuery } from '../application/queries/get-unread-count.query';
import { MarkDeliveryReadCommand } from '../application/commands/mark-delivery-read.command';
import { MarkAllReadCommand } from '../application/commands/mark-all-read.command';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('inbox')
  inbox(@CurrentUser() user: AuthUser, @Query('limit') limit?: string) {
    const n = Math.min(Math.max(parseInt(limit || '30', 10) || 30, 1), 100);
    return this.queryBus.execute(new GetInboxQuery(user.id, n));
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: AuthUser) {
    return this.queryBus.execute(new GetUnreadCountQuery(user.id));
  }

  @Patch('deliveries/:id/read')
  markRead(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.commandBus.execute(new MarkDeliveryReadCommand(user.id, id));
  }

  @Post('deliveries/mark-all-read')
  markAllRead(@CurrentUser() user: AuthUser) {
    return this.commandBus.execute(new MarkAllReadCommand(user.id));
  }
}
