import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '@config/config.module';
import { MultimediaAsset } from './domain/multimedia-asset.entity';
import { MultimediaService } from './application/multimedia.service';
import { OBJECT_STORAGE } from './application/ports/object-storage.port';
import { LocalObjectStorage } from './infrastructure/local-object-storage';
import { MultimediaController } from './presentation/multimedia.controller';

@Module({
  imports: [AppConfigModule, TypeOrmModule.forFeature([MultimediaAsset])],
  controllers: [MultimediaController],
  providers: [
    MultimediaService,
    { provide: OBJECT_STORAGE, useClass: LocalObjectStorage },
  ],
  exports: [MultimediaService, TypeOrmModule],
})
export class MultimediaModule {}
