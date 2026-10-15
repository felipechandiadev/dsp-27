import { ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lat?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lng?: number | null;

  @ApiPropertyOptional({ type: LocationGeometryDto, nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsObject()
  @ValidateNested()
  @Type(() => LocationGeometryDto)
  locationGeometry?: LocationGeometryDto | null;
}
