import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateRequirementDto {
  @ApiProperty({ enum: ['missing', 'received', 'approved', 'rejected'] })
  @IsIn(['missing', 'received', 'approved', 'rejected'])
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
