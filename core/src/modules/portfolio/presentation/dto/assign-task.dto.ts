import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID, IsString } from 'class-validator';

export class AssignTaskDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  personId: string;

  @ApiPropertyOptional({
    enum: ['owner', 'executor', 'reviewer', 'support'],
    default: 'executor',
  })
  @IsOptional()
  @IsString()
  @IsIn(['owner', 'executor', 'reviewer', 'support'])
  assignmentRole?: string;
}
