import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@modules/users/users.module';
import { AppConfigModule } from '@config/config.module';
import { AppConfigService } from '@config/config.service';
import { AuthController } from './presentation/auth.controller';
import { LoginHandler } from './application/handlers/login.handler';
import { GetMeHandler } from './application/handlers/get-me.handler';
import { ChangePasswordHandler } from './application/handlers/change-password.handler';
import { JwtStrategy } from './infrastructure/jwt.strategy';

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    AppConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: config.jwtExpiresIn as `${number}h` },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginHandler,
    GetMeHandler,
    ChangePasswordHandler,
    JwtStrategy,
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
