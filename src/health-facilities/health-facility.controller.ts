/* eslint-disable @typescript-eslint/no-unsafe-return */
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
import { HealthFacilityService } from './health-facility.service';
import {
  CreateHealthFacilityDto,
  FindHealthFacilityDto,
  UpdateHealthFacilityDto,
} from './health-facility.dto';
import { ApiErrorsResponse, OriginalUrl } from '../common/common.decorators';
import { ApiOperation } from '@nestjs/swagger';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { RequireSystemPermission } from '../auth/auth.decorators';

@Controller('health-facilities')
export class HealthFacilityController {
  constructor(private readonly healthFacilityService: HealthFacilityService) {}

  @Post()
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Create a new health facility' })
  @RequireSystemPermission({
    healthFacility: ['create'],
  })
  create(@Body() createHealthFacilityDto: CreateHealthFacilityDto) {
    return this.healthFacilityService.create(createHealthFacilityDto);
  }

  @Get()
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get all health facilities' })
  @OptionalAuth()
  findAll(
    @Query() findHealthFacilityDto: FindHealthFacilityDto,
    @OriginalUrl() originalUrl: string,
  ) {
    return this.healthFacilityService.findAll(
      findHealthFacilityDto,
      originalUrl,
    );
  }

  @Get(':id')
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get a health facility by ID' })
  @OptionalAuth()
  findOne(@Param('id') id: string) {
    return this.healthFacilityService.findOne(id);
  }

  @Put(':id')
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Update a health facility by ID' })
  @RequireSystemPermission({
    healthFacility: ['update'],
  })
  update(
    @Param('id') id: string,
    @Body() updateHealthFacilityDto: UpdateHealthFacilityDto,
  ) {
    return this.healthFacilityService.update(id, updateHealthFacilityDto);
  }

  @Delete(':id')
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Delete a health facility by ID' })
  @RequireSystemPermission({
    healthFacility: ['delete'],
  })
  delete(@Param('id') id: string) {
    return this.healthFacilityService.delete(id);
  }
}
