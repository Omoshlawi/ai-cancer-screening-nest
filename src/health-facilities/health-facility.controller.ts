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
  HealthFacilityResponseDto,
  FindHealthFacilityResponseDto,
  FindNearestHealthFacilityDto,
  FindNearestHealthFacilityResponseDto,
} from './health-facility.dto';
import { ApiErrorsResponse, OriginalUrl } from '../common/common.decorators';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { RequireSystemPermission } from '../auth/auth.decorators';

@Controller('health-facilities')
export class HealthFacilityController {
  constructor(private readonly healthFacilityService: HealthFacilityService) { }

  @Post()
  @ApiOkResponse({ type: HealthFacilityResponseDto })
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Create a new health facility' })
  @RequireSystemPermission({
    healthFacility: ['create'],
  })
  create(@Body() createHealthFacilityDto: CreateHealthFacilityDto) {
    return this.healthFacilityService.create(createHealthFacilityDto);
  }

  @Get()
  @ApiOkResponse({ type: FindHealthFacilityResponseDto })
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

  @Get('nearest')
  @ApiOkResponse({ type: FindNearestHealthFacilityResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({
    summary: 'Find the nearest health facilities to given coordinates',
    description:
      'Returns the nearest health facilities sorted by distance from the provided coordinates. ' +
      'The search uses an efficient iterative approach with bounding box filtering, starting with a small radius and expanding until the target count is found. ' +
      'All configuration parameters are optional and have sensible defaults optimized for large datasets. ' +
      'For best performance with large datasets, use smaller initialDistanceKm and distanceIncrementKm values, and adjust fetchMultiplier based on facility density.',
  })
  @OptionalAuth()
  findNearest(
    @Query() findNearestHealthFacilityDto: FindNearestHealthFacilityDto,
  ) {
    return this.healthFacilityService.findNearest(findNearestHealthFacilityDto);
  }

  @Get('counties')
  @ApiOkResponse()
  @ApiOperation({ summary: 'Get all counties' })
  @OptionalAuth()
  getCounties() {
    return this.healthFacilityService.getCounties();
  }

  @Get('subcounties')
  @ApiOkResponse()
  @ApiOperation({ summary: 'Get subcounties by county name' })
  @OptionalAuth()
  getSubcounties(@Query('county') county: string) {
    return this.healthFacilityService.getSubcounties(county);
  }

  @Get('wards')
  @ApiOkResponse()
  @ApiOperation({ summary: 'Get wards by subcounty name' })
  @OptionalAuth()
  getWards(@Query('subcounty') subcounty: string) {
    return this.healthFacilityService.getWards(subcounty);
  }



  @Get(':id')
  @ApiOkResponse({ type: HealthFacilityResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get a health facility by ID' })
  @OptionalAuth()
  findOne(@Param('id') id: string) {
    return this.healthFacilityService.findOne(id);
  }

  @Put(':id')
  @ApiOkResponse({ type: HealthFacilityResponseDto })
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
  @ApiOkResponse({ type: HealthFacilityResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Delete a health facility by ID' })
  @RequireSystemPermission({
    healthFacility: ['delete'],
  })
  delete(@Param('id') id: string) {
    return this.healthFacilityService.delete(id);
  }
}
