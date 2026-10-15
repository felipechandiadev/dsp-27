import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationGeometryDto } from './location-geometry.dto';

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

  @ApiPropertyOptional({ type: LocationGeometryDto, nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsObject()
  @ValidateNested()
  @Type(() => LocationGeometryDto)
  locationGeometry?: LocationGeometryDto | null;

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
