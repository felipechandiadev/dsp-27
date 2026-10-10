import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class PatchOperationStatusDto {
  @ApiProperty({
    enum: [
      'asignada',
      'en_traslado',
      'ejecutando',
      'finalizada',
      'cancelada',
      'fallida',
    ],
  })
  @IsIn([
    'asignada',
    'en_traslado',
    'ejecutando',
    'finalizada',
    'cancelada',
    'fallida',
  ])
  status: string;
}
