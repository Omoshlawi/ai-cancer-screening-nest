import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Session } from '@thallesp/nestjs-better-auth';
import { RequireSystemPermission } from '../auth/auth.decorators';
import { RequireChp } from '../chps/chp.decorators';
import { ApiErrorsResponse, OriginalUrl } from '../common/common.decorators';
import { UserSession } from '../auth/auth.types';
import {
  CreateProviderFacilityDto,
  FindProviderFacilityDto,
} from './provider-facility.dto';
import { ProviderFacilityService } from './provider-facility.service';

@Controller('provider-facilities')
export class ProviderFacilityController {
  constructor(
    private readonly providerFacilityService: ProviderFacilityService,
  ) {}

  @Post()
  @RequireSystemPermission({ providerFacility: ['create'] })
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Map a health provider to a health facility' })
  create(@Body() dto: CreateProviderFacilityDto) {
    return this.providerFacilityService.create(dto);
  }

  @Get()
  @RequireSystemPermission({ providerFacility: ['list'] })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'List all provider-facility mappings' })
  findAll(
    @Query() dto: FindProviderFacilityDto,
    @OriginalUrl() originalUrl: string,
  ) {
    return this.providerFacilityService.findAll(dto, originalUrl);
  }

  @Get('my-facilities')
  @RequireChp()
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get facilities mapped to the current provider' })
  findMyFacilities(@Session() session: UserSession) {
    return this.providerFacilityService.findMyFacilities(session.user.id);
  }

  @Delete(':id')
  @RequireSystemPermission({ providerFacility: ['delete'] })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Remove a provider-facility mapping' })
  delete(@Param('id') id: string) {
    return this.providerFacilityService.delete(id);
  }
}
