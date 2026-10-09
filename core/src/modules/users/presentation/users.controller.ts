import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { USER_ADMIN_ROLES } from '@modules/users/domain/user-roles';
import { ListUsersQuery } from '../application/queries/list-users.query';
import { CreateUserCommand } from '../application/commands/create-user.command';
import { UpdateUserCommand } from '../application/commands/update-user.command';
import { ResetUserPasswordCommand } from '../application/commands/reset-user-password.command';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...USER_ADMIN_ROLES)
@Controller('users')
export class UsersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  list(@Query('status') status?: string) {
    return this.queryBus.execute(new ListUsersQuery(status));
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.commandBus.execute(
      new CreateUserCommand({
        username: dto.username,
        password: dto.password,
        role: dto.role,
        personaId: dto.personaId,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
      }),
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.commandBus.execute(
      new UpdateUserCommand(id, {
        role: dto.role,
        status: dto.status,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
      }),
    );
  }

  @Post(':id/reset-password')
  resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.commandBus.execute(
      new ResetUserPasswordCommand(id, dto.newPassword),
    );
  }
}
