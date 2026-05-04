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
import {
  ApiErrorsResponse,
  OriginalUrl,
  IpAddress,
  UserAgent,
} from '../common/common.decorators';
import { ApiOperation } from '@nestjs/swagger';
import { RequireChp } from '../chps/chp.decorators';
import { RequireSystemPermission } from '../auth/auth.decorators';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }

  @Post()
  @RequireChp()
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Create a new client' })
  create(
    @Body() createClientDto: CreateClientDto,
    @Session() session: UserSession,
    @IpAddress() ipAddress: string | undefined,
    @UserAgent() userAgent: string | undefined,
  ) {
    return this.clientsService.create(
      createClientDto,
      session.user,
      ipAddress,
      userAgent,
    );
  }

  @Get()
  @RequireSystemPermission({
    clients: ['list'],
  })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get all clients' })
  findAll(
    @Query() findClientDto: FindClientDto,
    @OriginalUrl() originalUrl: string,
  ) {
    return this.clientsService.findAll(findClientDto, originalUrl);
  }

  @Get(':id')
  @RequireSystemPermission({
    clients: ['list'],
  })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get a client by ID' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Put(':id')
  @RequireSystemPermission({
    clients: ['update'],
  })
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Update a client by ID' })
  update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @Session() session: UserSession,
    @IpAddress() ipAddress: string | undefined,
    @UserAgent() userAgent: string | undefined,
  ) {
    return this.clientsService.update(
      id,
      updateClientDto,
      session.user,
      ipAddress,
      userAgent,
    );
  }

  @Delete(':id')
  @RequireSystemPermission({
    clients: ['delete'],
  })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Delete a client by ID' })
  delete(
    @Param('id') id: string,
    @Session() session: UserSession,
    @IpAddress() ipAddress: string | undefined,
    @UserAgent() userAgent: string | undefined,
  ) {
    return this.clientsService.delete(id, session.user, ipAddress, userAgent);
  }
}
