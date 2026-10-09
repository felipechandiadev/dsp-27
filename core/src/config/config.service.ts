import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get port(): number {
    return this.config.get<number>('PORT', 5080);
  }

  get apiPrefix(): string {
    return this.config.get<string>('API_PREFIX', 'api');
  }

  get jwtSecret(): string {
    return this.config.getOrThrow<string>('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.config.get<string>('JWT_EXPIRES_IN', '24h');
  }

  get bcryptRounds(): number {
    return this.config.get<number>('BCRYPT_ROUNDS', 12);
  }

  get enableCors(): boolean {
    return this.config.get<boolean>('ENABLE_CORS', true);
  }

  get corsOrigin(): string {
    return this.config.get<string>('CORS_ORIGIN', '*');
  }

  get corsCredentials(): boolean {
    return this.config.get<boolean>('CORS_CREDENTIALS', false);
  }

  get enableSwagger(): boolean {
    return this.config.get<boolean>('ENABLE_SWAGGER', true);
  }

  get database() {
    return {
      host: this.config.getOrThrow<string>('DB_HOST'),
      port: this.config.get<number>('DB_PORT', 5432),
      username: this.config.getOrThrow<string>('DB_USERNAME'),
      password: this.config.get<string>('DB_PASSWORD', ''),
      database: this.config.getOrThrow<string>('DB_DATABASE'),
      synchronize: this.config.get<boolean>('DB_SYNCHRONIZE', false),
      logging: this.config.get<boolean>('DB_LOGGING', false),
      ssl: this.config.get<boolean>('DB_SSL', false),
      maxConnections: this.config.get<number>('DB_MAX_CONNECTIONS', 10),
      connectionTimeout: this.config.get<number>('DB_CONNECTION_TIMEOUT', 60000),
    };
  }

  get storageDriver(): 'local' | 'r2' {
    return this.config.get<'local' | 'r2'>('STORAGE_DRIVER', 'local');
  }

  get storageLocalDir(): string {
    return this.config.get<string>('STORAGE_LOCAL_DIR', './storage/uploads');
  }

  get microsoft() {
    const clientId = this.config.get<string>('MS_CLIENT_ID', '')?.trim() || '';
    return {
      clientId,
      clientSecret:
        this.config.get<string>('MS_CLIENT_SECRET', '')?.trim() || '',
      tenantId: this.config.get<string>('MS_TENANT_ID', 'common') || 'common',
      redirectUri:
        this.config.get<string>('MS_REDIRECT_URI', '')?.trim() || '',
      appRedirectUri:
        this.config.get<string>('MS_APP_REDIRECT_URI', '')?.trim() ||
        'http://localhost:5081/settings',
      tokenEncryptionKey:
        this.config.get<string>('MS_TOKEN_ENCRYPTION_KEY', '')?.trim() || '',
      configured: Boolean(clientId),
      appOnlyCalendar: this.config.get<boolean>('MS_APP_ONLY_CALENDAR', false),
      scopes: [
        'openid',
        'profile',
        'offline_access',
        'User.Read',
        'Mail.Read',
        'Mail.Send',
        'Calendars.ReadWrite',
      ] as const,
    };
  }

  get notifications() {
    return {
      dedupWindowMinutes: this.config.get<number>(
        'NOTIFICATION_DEDUP_WINDOW_MINUTES',
        15,
      ),
      outboxPollMs: this.config.get<number>(
        'NOTIFICATION_OUTBOX_POLL_MS',
        15000,
      ),
      outboxBatchSize: this.config.get<number>(
        'NOTIFICATION_OUTBOX_BATCH_SIZE',
        20,
      ),
    };
  }
}
