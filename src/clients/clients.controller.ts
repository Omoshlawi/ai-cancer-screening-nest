import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, FindClientDto, UpdateClientDto } from './client.dto';
import { Session } from '@thallesp/nestjs-better-auth';
import { UserSession } from '../auth/auth.types';
import { ApiErrorsResponse, OriginalUrl } from '../common/common.decorators';
import { ApiOperation } from '@nestjs/swagger';
import { RequireChp } from '../chps/chp.decorators';

@Controller('clients')
@RequireChp()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Create a new client' })
  create(
    @Body() createClientDto: CreateClientDto,
    @Session() session: UserSession,
  ) {
    return this.clientsService.create(createClientDto, session.user);
  }

  @Get()
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get all clients' })
  findAll(
    @Query() findClientDto: FindClientDto,
    @OriginalUrl() originalUrl: string,
  ) {
    return this.clientsService.findAll(findClientDto, originalUrl);
  }

  @Get(':id')
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get a client by ID' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Put(':id')
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Update a client by ID' })
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Delete a client by ID' })
  delete(@Param('id') id: string) {
    return this.clientsService.delete(id);
  }
}
