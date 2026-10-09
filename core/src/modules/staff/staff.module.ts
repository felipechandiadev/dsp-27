import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from '@modules/persons/domain/person.entity';
import { User } from '@modules/users/domain/user.entity';
import { Task } from '@modules/portfolio/domain/task.entity';
import { TaskAssignee } from '@modules/portfolio/domain/task-assignee.entity';
import { WorkNote } from '@modules/portfolio/domain/work-note.entity';
import { MultimediaModule } from '@modules/multimedia/multimedia.module';
import { StaffMember } from './domain/staff-member.entity';
import { StaffRequirementCheck } from './domain/staff-requirement-check.entity';
import { STAFF_REPOSITORY } from './application/ports/staff.repository.port';
import { TypeOrmStaffRepository } from './infrastructure/typeorm-staff.repository';
import { StaffController } from './presentation/staff.controller';
import { ListStaffHandler } from './application/handlers/list-staff.handler';
import { GetStaffHandler } from './application/handlers/get-staff.handler';
import { CreateStaffHandler } from './application/handlers/create-staff.handler';
import { UpdateStaffHandler } from './application/handlers/update-staff.handler';
import { UpdateRequirementHandler } from './application/handlers/update-requirement.handler';

@Module({
  imports: [
    CqrsModule,
    MultimediaModule,
    TypeOrmModule.forFeature([
      Person,
      User,
      StaffMember,
      StaffRequirementCheck,
      Task,
      TaskAssignee,
      WorkNote,
    ]),
  ],
  controllers: [StaffController],
  providers: [
    { provide: STAFF_REPOSITORY, useClass: TypeOrmStaffRepository },
    ListStaffHandler,
    GetStaffHandler,
    CreateStaffHandler,
    UpdateStaffHandler,
    UpdateRequirementHandler,
  ],
  exports: [TypeOrmModule, STAFF_REPOSITORY],
})
export class StaffModule {}
