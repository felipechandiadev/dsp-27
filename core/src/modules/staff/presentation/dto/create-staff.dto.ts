import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({
    enum: ['analisis', 'prevencion', 'operaciones', 'direccion', 'grd'],
  })
  @IsIn(['analisis', 'prevencion', 'operaciones', 'direccion', 'grd'])
  unit: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  personaId?: string;

  @ApiPropertyOptional({ example: 'RUT' })
  @ValidateIf((o: CreateStaffDto) => !o.personaId)
  @IsString()
  documentType?: string;

  @ApiPropertyOptional({ example: '11.222.333-4' })
  @ValidateIf((o: CreateStaffDto) => !o.personaId)
  @IsString()
  documentNumber?: string;

  @ApiPropertyOptional()
  @ValidateIf((o: CreateStaffDto) => !o.personaId)
  @IsString()
  @MinLength(1)
  firstName?: string;

  @ApiPropertyOptional()
  @ValidateIf((o: CreateStaffDto) => !o.personaId)
  @IsString()
  @MinLength(1)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiPropertyOptional({
    enum: ['fiscalizador', 'coadyuvante', 'no_operativo'],
  })
  @IsOptional()
  @IsIn(['fiscalizador', 'coadyuvante', 'no_operativo'])
  ds97Profile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  appointmentAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  priorToLaw?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workEmail?: string;

  @ApiPropertyOptional({ enum: ['active', 'on_leave', 'terminated'] })
  @IsOptional()
  @IsIn(['active', 'on_leave', 'terminated'])
  status?: string;
}
