import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, ValidateIf } from 'class-validator';

export class LocationGeometryDto {
  @ApiProperty({ enum: ['Point', 'LineString', 'Polygon'] })
  @IsIn(['Point', 'LineString', 'Polygon'])
  type: 'Point' | 'LineString' | 'Polygon';

  @ApiProperty({
    description: 'GeoJSON coordinates according to type',
    example: [-71.8265, -36.1415],
  })
  @IsArray()
  coordinates: number[] | number[][] | number[][][];
}

/** Accepts nested geometry object or explicit null to clear. */
export class OptionalLocationGeometryDto {
  @ApiPropertyOptional({ type: LocationGeometryDto, nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  locationGeometry?: LocationGeometryDto | null;
}
