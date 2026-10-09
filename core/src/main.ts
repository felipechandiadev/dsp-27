import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);

  app.setGlobalPrefix(config.apiPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  if (config.enableCors) {
    app.enableCors({
      origin:
        config.corsOrigin === '*' || config.corsOrigin === 'all'
          ? true
          : config.corsOrigin.split(',').map((o) => o.trim()),
      credentials: config.corsCredentials,
    });
  }

  if (config.enableSwagger) {
    const doc = new DocumentBuilder()
      .setTitle('DSP-27 API')
      .setDescription('Dirección de Seguridad Pública — Plan 2027')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, doc));
  }

  await app.listen(config.port, '::');
  // eslint-disable-next-line no-console
  console.log(`DSP-27 core listening on http://localhost:${config.port}/${config.apiPrefix}`);
}

bootstrap();
