import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateRequerimientoDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  descripcion: string;

  @ApiPropertyOptional({ enum: ['P0', 'P1', 'P2', 'P3'] })
  @IsOptional()
  @IsIn(['P0', 'P1', 'P2', 'P3'])
  prioridad?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  occurredAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  areaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  incidenciaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  personaSolicitanteId?: string;
}
