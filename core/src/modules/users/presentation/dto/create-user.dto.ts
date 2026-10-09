import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { USER_ROLES } from '@modules/users/domain/user-roles';

export class CreateUserDto {
  @ApiProperty({ example: 'nuevo.usuario' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: USER_ROLES })
  @IsIn([...USER_ROLES])
  role: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  personaId?: string;

  @ApiPropertyOptional({ example: 'RUT' })
  @ValidateIf((o: CreateUserDto) => !o.personaId)
  @IsString()
  documentType?: string;

  @ApiPropertyOptional({ example: '12.345.678-9' })
  @ValidateIf((o: CreateUserDto) => !o.personaId)
  @IsString()
  documentNumber?: string;

  @ApiPropertyOptional()
  @ValidateIf((o: CreateUserDto) => !o.personaId)
  @IsString()
  @MinLength(1)
  firstName?: string;

  @ApiPropertyOptional()
  @ValidateIf((o: CreateUserDto) => !o.personaId)
  @IsString()
  @MinLength(1)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}
