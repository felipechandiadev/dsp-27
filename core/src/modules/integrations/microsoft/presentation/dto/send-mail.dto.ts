import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMailDto {
  @ApiProperty({ example: 'destinatario@ejemplo.cl' })
  @IsEmail()
  to: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  subject: string;

  @ApiProperty({ description: 'Cuerpo HTML del correo' })
  @IsString()
  @MinLength(1)
  bodyHtml: string;
}
