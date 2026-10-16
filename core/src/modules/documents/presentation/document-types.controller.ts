import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUser } from '@modules/auth/domain/jwt-payload';
import { ListDocumentTypesQuery } from '../application/queries/list-document-types.query';
import { CreateDocumentTypeCommand } from '../application/commands/create-document-type.command';
import { UpdateDocumentTypeCommand } from '../application/commands/update-document-type.command';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';

@ApiTags('document-types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('document-types')
export class DocumentTypesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  list(@Query('status') status?: string) {
    return this.queryBus.execute(new ListDocumentTypesQuery(status));
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDocumentTypeDto) {
    return this.commandBus.execute(
      new CreateDocumentTypeCommand(user.role, {
        name: dto.name,
        description: dto.description,
        sortOrder: dto.sortOrder,
        creationMode: dto.creationMode,
      }),
    );
  }

  @Patch(':code')
  update(
    @CurrentUser() user: AuthUser,
    @Param('code') code: string,
    @Body() dto: UpdateDocumentTypeDto,
  ) {
    return this.commandBus.execute(
      new UpdateDocumentTypeCommand(user.role, code, { ...dto }),
    );
  }
}
