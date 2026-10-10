import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class PatchOperationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  briefing?: string | null;

  @ApiPropertyOptional({ enum: ['P0', 'P1', 'P2', 'P3'] })
  @IsOptional()
  @IsIn(['P0', 'P1', 'P2', 'P3'])
  prioridad?: string;
}
