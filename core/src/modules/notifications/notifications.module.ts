import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '@config/config.module';
import { AppConfigService } from '@config/config.service';
import { MicrosoftModule } from '@modules/integrations/microsoft/microsoft.module';
import { Notification } from './domain/notification.entity';
import { NotificationDelivery } from './domain/notification-delivery.entity';
import { NotificationOutbox } from './domain/notification-outbox.entity';
import { NOTIFICATION_REPOSITORY } from './application/ports/notification.repository.port';
import { NOTIFICATION_PUBLISHER } from './application/ports/notification.publisher.port';
import { REALTIME_PUBLISHER } from './application/ports/realtime.publisher.port';
import { MAIL_SENDER } from './application/ports/mail-sender.port';
import { TypeOrmNotificationRepository } from './infrastructure/typeorm-notification.repository';
import { NotificationsRealtimePublisher } from './infrastructure/notifications-realtime.publisher';
import { ActorOutlookMailSender } from './infrastructure/actor-outlook-mail.sender';
import { NotificationPublisherService } from './application/notification-publisher.service';
import { OutboxWorkerService } from './application/outbox-worker.service';
import { NotificationsController } from './presentation/notifications.controller';
import { NotificationsGateway } from './presentation/notifications.gateway';
import { GetInboxHandler } from './application/handlers/get-inbox.handler';
import { GetUnreadCountHandler } from './application/handlers/get-unread-count.handler';
import { MarkDeliveryReadHandler } from './application/handlers/mark-delivery-read.handler';
import { MarkAllReadHandler } from './application/handlers/mark-all-read.handler';

@Module({
  imports: [
    CqrsModule,
    AppConfigModule,
    MicrosoftModule,
    TypeOrmModule.forFeature([
      Notification,
      NotificationDelivery,
      NotificationOutbox,
    ]),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.jwtSecret,
      }),
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsGateway,
    { provide: NOTIFICATION_REPOSITORY, useClass: TypeOrmNotificationRepository },
    { provide: REALTIME_PUBLISHER, useClass: NotificationsRealtimePublisher },
    { provide: MAIL_SENDER, useClass: ActorOutlookMailSender },
    {
      provide: NOTIFICATION_PUBLISHER,
      useClass: NotificationPublisherService,
    },
    NotificationPublisherService,
    OutboxWorkerService,
    GetInboxHandler,
    GetUnreadCountHandler,
    MarkDeliveryReadHandler,
    MarkAllReadHandler,
  ],
  exports: [NOTIFICATION_PUBLISHER, NotificationPublisherService],
})
export class NotificationsModule {}
