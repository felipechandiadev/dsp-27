import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CertifyPeriodDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
