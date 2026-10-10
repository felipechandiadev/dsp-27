import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ enum: ['Polygon'] })
  @IsIn(['Polygon'])
  type: 'Polygon';

  @ApiProperty({
    type: 'array',
    example: [
      [
        [-71.84, -36.15],
        [-71.82, -36.15],
        [-71.82, -36.13],
        [-71.84, -36.13],
        [-71.84, -36.15],
      ],
    ],
  })
  @IsArray()
  coordinates: number[][][];
}

export class CreateAreaDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty()
  @IsUUID()
  typeId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ type: GeoJsonPolygonDto })
  @IsObject()
  @ValidateNested()
  @Type(() => GeoJsonPolygonDto)
  geometry: GeoJsonPolygonDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}
