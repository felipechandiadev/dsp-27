import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/user.entity';
import { Person } from '@modules/persons/domain/person.entity';
import { USER_REPOSITORY } from './application/ports/user.repository.port';
import { TypeOrmUserRepository } from './infrastructure/typeorm-user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, Person])],
  providers: [
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
  ],
  exports: [TypeOrmModule, USER_REPOSITORY],
})
export class UsersModule {}
