import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateNormDto {
  @ApiPropertyOptional({ enum: LEGAL_NORM_KINDS })
  @IsOptional()
  @IsIn([...LEGAL_NORM_KINDS])
  kind?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  numberLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  shortTitle?: string;

  @ApiPropertyOptional({ enum: LEGAL_NORM_STATUSES })
  @IsOptional()
  @IsIn([...LEGAL_NORM_STATUSES])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  publishedOn?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  effectiveOn?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
