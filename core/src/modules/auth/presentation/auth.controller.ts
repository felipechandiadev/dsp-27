import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginCommand } from '../application/commands/login.command';
import { ChangePasswordCommand } from '../application/commands/change-password.command';
import { GetMeQuery } from '../application/queries/get-me.query';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUser } from '../domain/jwt-payload';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.commandBus.execute(new LoginCommand(dto.username, dto.password));
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.queryBus.execute(new GetMeQuery(user.id));
  }

  @Post('change-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.commandBus.execute(
      new ChangePasswordCommand(
        user.id,
        dto.currentPassword,
        dto.newPassword,
      ),
    );
  }
}
