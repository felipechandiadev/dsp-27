import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class CloseRequerimientoDto {
  @ApiProperty({ enum: ['resuelto', 'no_resuelto', 'descartado'] })
  @IsIn(['resuelto', 'no_resuelto', 'descartado'])
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
