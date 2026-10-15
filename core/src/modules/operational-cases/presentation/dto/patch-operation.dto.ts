import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationGeometryDto } from './location-geometry.dto';

export class PatchOperationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  briefing?: string | null;

  @ApiPropertyOptional({ enum: ['P0', 'P1', 'P2', 'P3'] })
  @IsOptional()
  @IsIn(['P0', 'P1', 'P2', 'P3'])
  prioridad?: string;

  @ApiPropertyOptional({ type: LocationGeometryDto, nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsObject()
  @ValidateNested()
  @Type(() => LocationGeometryDto)
  locationGeometry?: LocationGeometryDto | null;
}
