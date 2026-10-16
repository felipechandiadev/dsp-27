import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateStaffDto {
  @ApiPropertyOptional({
    enum: ['analisis', 'prevencion', 'operaciones', 'direccion', 'grd'],
  })
  @IsOptional()
  @IsIn(['analisis', 'prevencion', 'operaciones', 'direccion', 'grd'])
  unit?: string;

  @ApiPropertyOptional({
    enum: ['fiscalizador', 'coadyuvante', 'no_operativo'],
  })
  @IsOptional()
  @IsIn(['fiscalizador', 'coadyuvante', 'no_operativo'])
  ds97Profile?: string | null;

  @ApiPropertyOptional({
    enum: ['none', 'pending', 'granted', 'revoked'],
  })
  @IsOptional()
  @IsIn(['none', 'pending', 'granted', 'revoked'])
  inspectorQualityStatus?: string;

  @ApiPropertyOptional({
    description: 'Solo dirección: conceder calidad sin checklist completo',
  })
  @IsOptional()
  @IsBoolean()
  forceGrant?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  appointmentAt?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  priorToLaw?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeNumber?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workEmail?: string | null;

  @ApiPropertyOptional({ enum: ['active', 'on_leave', 'terminated'] })
  @IsOptional()
  @IsIn(['active', 'on_leave', 'terminated'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  maritalStatus?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationality?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profession?: string | null;
}
