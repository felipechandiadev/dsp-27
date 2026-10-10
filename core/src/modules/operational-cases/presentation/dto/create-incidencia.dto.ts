import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateIncidenciaDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  incidentTypeId?: string;

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
  requerimientoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ingressChannel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  registrationOrigin?: string;
}
