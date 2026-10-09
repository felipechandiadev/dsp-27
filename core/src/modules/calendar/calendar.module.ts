import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '@config/config.module';
import { UsersModule } from '@modules/users/users.module';
import { Task } from '@modules/portfolio/domain/task.entity';
import { TaskAssignee } from '@modules/portfolio/domain/task-assignee.entity';
import { CalendarController } from './presentation/calendar.controller';
import { DSP_AGENDA } from './application/ports/dsp-agenda.port';
import { TEAM_CALENDAR_GRAPH } from './application/ports/team-calendar-graph.port';
import { TypeOrmDspAgenda } from './infrastructure/typeorm-dsp-agenda';
import { AppOnlyTeamCalendarGraph } from './infrastructure/app-only-team-calendar-graph';
import { ListCalendarPeopleHandler } from './application/handlers/list-calendar-people.handler';
import { GetTeamCalendarHandler } from './application/handlers/get-team-calendar.handler';

@Module({
  imports: [
    CqrsModule,
    AppConfigModule,
    UsersModule,
    TypeOrmModule.forFeature([Task, TaskAssignee]),
  ],
  controllers: [CalendarController],
  providers: [
    { provide: DSP_AGENDA, useClass: TypeOrmDspAgenda },
    { provide: TEAM_CALENDAR_GRAPH, useClass: AppOnlyTeamCalendarGraph },
    ListCalendarPeopleHandler,
    GetTeamCalendarHandler,
  ],
})
export class CalendarModule {}
