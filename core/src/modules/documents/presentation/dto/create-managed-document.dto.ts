import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateManagedDocumentDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  documentTypeId?: string | null;

  @ApiPropertyOptional({ description: 'Código del tipo (alternativa a id)' })
  @IsOptional()
  @IsString()
  documentTypeCode?: string | null;

  @ApiPropertyOptional({ enum: ['draft', 'published'] })
  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: string;

  @ApiPropertyOptional({ description: 'Documento Tiptap/ProseMirror JSON' })
  @IsOptional()
  @IsObject()
  bodyJson?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bodyHtml?: string | null;

  @ApiPropertyOptional({ description: 'Asset multimedia del cuerpo DOCX' })
  @IsOptional()
  @IsUUID()
  bodyAssetId?: string | null;
}
