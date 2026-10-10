import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class PatchRequerimientoStatusDto {
  @ApiProperty({ enum: ['ingresado', 'en_gestion'] })
  @IsIn(['ingresado', 'en_gestion'])
  status: string;
}
