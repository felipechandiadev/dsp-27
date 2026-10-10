import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class PatchIncidenciaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  incidentTypeId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationDescription?: string | null;
}
