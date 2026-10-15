import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationGeometryDto } from './location-geometry.dto';

export class DeployOperationDto {
  @ApiProperty({
    enum: ['requerimiento', 'incidencia', 'leadership_instruction'],
  })
  @IsIn(['requerimiento', 'incidencia', 'leadership_instruction'])
  triggerType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  operationTypeId?: string;

  @ApiPropertyOptional({ enum: ['P0', 'P1', 'P2', 'P3'] })
  @IsOptional()
  @IsIn(['P0', 'P1', 'P2', 'P3'])
  prioridad?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  briefing?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  requerimientoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  incidenciaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedStaffId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  areaId?: string;

  @ApiPropertyOptional({ type: LocationGeometryDto, nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsObject()
  @ValidateNested()
  @Type(() => LocationGeometryDto)
  locationGeometry?: LocationGeometryDto | null;
}
