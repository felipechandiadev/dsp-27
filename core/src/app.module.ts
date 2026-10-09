import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { AppConfigModule } from './config/config.module';
import { AppConfigService } from './config/config.service';
import { buildTypeOrmOptions } from './config/typeorm.config';
import { HealthModule } from './modules/health/health.module';
import { PersonsModule } from './modules/persons/persons.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PlanModule } from './modules/plan/plan.module';
import { LegalModule } from './modules/legal/legal.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { MicrosoftModule } from './modules/integrations/microsoft/microsoft.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { StaffModule } from './modules/staff/staff.module';
import { MultimediaModule } from './modules/multimedia/multimedia.module';
import { RecordCodesModule } from './modules/record-codes/record-codes.module';

@Module({
  imports: [
    AppConfigModule,
    CqrsModule.forRoot(),
    RecordCodesModule,
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => buildTypeOrmOptions(config),
    }),
    HealthModule,
    PersonsModule,
    UsersModule,
    AuthModule,
    PlanModule,
    LegalModule,
    PortfolioModule,
    MicrosoftModule,
    NotificationsModule,
    CalendarModule,
    ContractsModule,
    StaffModule,
    MultimediaModule,
  ],
})
export class AppModule {}

