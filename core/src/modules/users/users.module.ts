import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/user.entity';
import { Person } from '@modules/persons/domain/person.entity';
import { USER_REPOSITORY } from './application/ports/user.repository.port';
import { TypeOrmUserRepository } from './infrastructure/typeorm-user.repository';
import { UsersController } from './presentation/users.controller';
import { ListUsersHandler } from './application/handlers/list-users.handler';
import { CreateUserHandler } from './application/handlers/create-user.handler';
import { UpdateUserHandler } from './application/handlers/update-user.handler';
import { ResetUserPasswordHandler } from './application/handlers/reset-user-password.handler';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([User, Person])],
  controllers: [UsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    ListUsersHandler,
    CreateUserHandler,
    UpdateUserHandler,
    ResetUserPasswordHandler,
  ],
  exports: [TypeOrmModule, USER_REPOSITORY],
})
export class UsersModule {}
