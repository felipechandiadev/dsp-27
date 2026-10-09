import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import {
  LEGAL_NORM_KINDS,
  LEGAL_NORM_STATUSES,
} from '@modules/legal/domain/legal-kinds';

export class CreateNormDto {
  @ApiProperty({ enum: LEGAL_NORM_KINDS })
  @IsIn([...LEGAL_NORM_KINDS])
  kind: string;

  @ApiProperty({ example: 'Ley N.º 21.802' })
  @IsString()
  @MinLength(1)
  numberLabel: string;

  @ApiProperty({ example: 'Ley de Seguridad Pública Comunal' })
  @IsString()
  @MinLength(1)
  shortTitle: string;

  @ApiPropertyOptional({ example: 'LEY-21802' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  code?: string;

  @ApiPropertyOptional({ enum: LEGAL_NORM_STATUSES })
  @IsOptional()
  @IsIn([...LEGAL_NORM_STATUSES])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  publishedOn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  effectiveOn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
