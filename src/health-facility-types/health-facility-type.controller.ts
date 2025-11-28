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
import { HealthFacilityTypeService } from './health-facility-type.service';
import {
  CreateHealthFacilityTypeDto,
  FindHealthFacilityTypeDto,
  UpdateHealthFacilityTypeDto,
  HealthFacilityTypeResponseDto,
  FindHealthFacilityTypeResponseDto,
} from './health-facility-type.dto';
import { ApiErrorsResponse, OriginalUrl } from '../common/common.decorators';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { RequireSystemPermission } from '../auth/auth.decorators';

@Controller('health-facility-types')
export class HealthFacilityTypeController {
  constructor(
    private readonly healthFacilityTypeService: HealthFacilityTypeService,
  ) {}

  @Post()
  @ApiOkResponse({ type: HealthFacilityTypeResponseDto })
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Create a new health facility type' })
  @RequireSystemPermission({
    healthFacilityType: ['create'],
  })
  create(@Body() createHealthFacilityTypeDto: CreateHealthFacilityTypeDto) {
    return this.healthFacilityTypeService.create(createHealthFacilityTypeDto);
  }

  @Get()
  @ApiOkResponse({ type: FindHealthFacilityTypeResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get all health facility types' })
  @OptionalAuth()
  findAll(
    @Query() findHealthFacilityTypeDto: FindHealthFacilityTypeDto,
    @OriginalUrl() originalUrl: string,
  ) {
    return this.healthFacilityTypeService.findAll(
      findHealthFacilityTypeDto,
      originalUrl,
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: HealthFacilityTypeResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get a health facility type by ID' })
  @OptionalAuth()
  findOne(@Param('id') id: string) {
    return this.healthFacilityTypeService.findOne(id);
  }

  @Put(':id')
  @ApiOkResponse({ type: HealthFacilityTypeResponseDto })
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Update a health facility type by ID' })
  @RequireSystemPermission({
    healthFacilityType: ['update'],
  })
  update(
    @Param('id') id: string,
    @Body() updateHealthFacilityTypeDto: UpdateHealthFacilityTypeDto,
  ) {
    return this.healthFacilityTypeService.update(
      id,
      updateHealthFacilityTypeDto,
    );
  }

  @Delete(':id')
  @ApiOkResponse({ type: HealthFacilityTypeResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Delete a health facility type by ID' })
  @RequireSystemPermission({
    healthFacilityType: ['delete'],
  })
  delete(@Param('id') id: string) {
    return this.healthFacilityTypeService.delete(id);
  }
}
