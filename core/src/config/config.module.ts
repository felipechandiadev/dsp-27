import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as path from 'path';
import { configSchema } from './config.schema';
import { AppConfigService } from './config.service';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(__dirname, '../../.env.local'),
        path.resolve(__dirname, '../../.env'),
      ],
      validationSchema: configSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
      cache: true,
      expandVariables: true,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
