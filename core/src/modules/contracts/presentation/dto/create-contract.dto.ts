import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateContractDto {
  @ApiProperty({ enum: ['arriendo', 'guardias', 'aparcadero', 'otro'] })
  @IsIn(['arriendo', 'guardias', 'aparcadero', 'otro'])
  kind: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: '76.123.456-7' })
  @IsString()
  contractorRut: string;

  @ApiProperty()
  @IsString()
  contractorName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contractorEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contractorPhone?: string;

  @ApiProperty({ description: 'UUID del usuario ITS' })
  @IsUUID()
  itsUserId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ example: '2027-01-01' })
  @IsDateString()
  startsOn: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endsOn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
