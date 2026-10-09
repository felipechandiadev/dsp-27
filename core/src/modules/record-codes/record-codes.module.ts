import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordCodeSequence } from './domain/record-code-sequence.entity';
import { RecordCodeService } from './application/record-code.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([RecordCodeSequence])],
  providers: [RecordCodeService],
  exports: [RecordCodeService],
})
export class RecordCodesModule {}
