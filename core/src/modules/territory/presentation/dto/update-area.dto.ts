import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class GeoJsonPolygonDto {
  @ApiPropertyOptional({ enum: ['Polygon'] })
  @IsIn(['Polygon'])
  type: 'Polygon';

  @IsArray()
  coordinates: number[][][];
}

export class UpdateAreaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  typeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @ApiPropertyOptional({ type: GeoJsonPolygonDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GeoJsonPolygonDto)
  geometry?: GeoJsonPolygonDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}
