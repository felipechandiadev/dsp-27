import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class OpenPeriodDto {
  @ApiPropertyOptional({ description: 'Default: año actual' })
  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({ description: 'Default: mes actual (1–12)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}
