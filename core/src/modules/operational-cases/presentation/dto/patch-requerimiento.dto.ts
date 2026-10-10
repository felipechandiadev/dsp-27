import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class PatchRequerimientoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  descripcion?: string;

  @ApiPropertyOptional({ enum: ['P0', 'P1', 'P2', 'P3'] })
  @IsOptional()
  @IsIn(['P0', 'P1', 'P2', 'P3'])
  prioridad?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationDescription?: string | null;
}
