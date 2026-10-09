import { Inject, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginCommand } from '../commands/login.command';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@modules/users/application/ports/user.repository.port';
import { AppConfigService } from '@config/config.service';

export type LoginResult = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: {
    id: string;
    username: string;
    role: string;
    personaId: string;
  };
};

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const user = await this.users.findByUsername(command.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(command.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.users.updateLastLogin(user.id, new Date());

    const payload = {
      sub: user.id,
      personaId: user.personaId,
      username: user.username,
      role: user.role,
    };

    const accessToken = await this.jwt.signAsync(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.config.jwtExpiresIn,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        personaId: user.personaId,
      },
    };
  }
}
