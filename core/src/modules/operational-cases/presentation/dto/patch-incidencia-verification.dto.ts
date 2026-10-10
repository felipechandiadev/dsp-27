import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class PatchIncidenciaVerificationDto {
  @ApiProperty({ enum: ['sin_verificar', 'verificada', 'descartada'] })
  @IsIn(['sin_verificar', 'verificada', 'descartada'])
  status: string;
}
