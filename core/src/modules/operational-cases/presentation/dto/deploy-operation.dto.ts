import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

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
}
