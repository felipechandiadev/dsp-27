import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { AppConfigService } from '@config/config.service';
import { NotificationOutbox } from '../domain/notification-outbox.entity';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepositoryPort,
} from './ports/notification.repository.port';
import { MAIL_SENDER, MailSenderPort } from './ports/mail-sender.port';

@Injectable()
export class OutboxWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxWorkerService.name);
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(
    private readonly config: AppConfigService,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repo: NotificationRepositoryPort,
    @Inject(MAIL_SENDER)
    private readonly mail: MailSenderPort,
  ) {}

  onModuleInit(): void {
    const ms = this.config.notifications.outboxPollMs;
    if (ms <= 0) return;
    this.timer = setInterval(() => {
      void this.tick();
    }, ms);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const batch = await this.repo.claimOutboxBatch(
        this.config.notifications.outboxBatchSize,
      );
      for (const row of batch) {
        await this.processClaimed(row);
      }
    } catch (err) {
      this.logger.warn(`outbox tick: ${(err as Error).message}`);
    } finally {
      this.running = false;
    }
  }

  async processClaimed(row: NotificationOutbox): Promise<void> {
    if (!row.toEmail || !row.actorUserId) {
      row.status = !row.toEmail
        ? 'skipped_no_recipient'
        : 'skipped_no_sender';
      await this.repo.saveOutbox(row);
      return;
    }

    const result = await this.mail.sendAsActor({
      actorUserId: row.actorUserId,
      to: row.toEmail,
      subject: row.subject,
      bodyHtml: row.bodyHtml,
    });

    if (result.ok) {
      row.status = 'sent';
      row.lastError = null;
      await this.repo.saveOutbox(row);
      return;
    }

    if (result.reason === 'no_sender') {
      row.status = 'skipped_no_sender';
      row.lastError = result.error ?? null;
      await this.repo.saveOutbox(row);
      return;
    }

    row.attempts += 1;
    row.lastError = result.error ?? 'send_failed';
    if (row.attempts >= row.maxAttempts) {
      row.status = 'failed';
    } else {
      row.status = 'pending';
      const minutes = Math.min(2 ** row.attempts, 60);
      row.nextAttemptAt = new Date(Date.now() + minutes * 60_000);
    }
    await this.repo.saveOutbox(row);
  }
}
