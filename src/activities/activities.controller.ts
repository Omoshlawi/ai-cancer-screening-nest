/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Post, Body, Query, Session } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import {
  CreateActivityDto,
  FindActivitiesDto,
  FindActivitiesResponseDto,
  ActivityDto,
} from './activities.dto';
import { UserSession } from '../auth/auth.types';
import {
  ApiErrorsResponse,
  OriginalUrl,
  IpAddress,
  UserAgent,
} from '../common/common.decorators';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Track a user activity' })
  @ApiOkResponse({ type: ActivityDto })
  async trackActivity(
    @Body() createActivityDto: CreateActivityDto,
    @Session() session: UserSession,
    @IpAddress() ipAddress: string | undefined,
    @UserAgent() userAgent: string | undefined,
  ) {
    return this.activitiesService.trackActivity(
      session.user.id,
      createActivityDto,
      ipAddress,
      userAgent,
    );
  }

  @Get()
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get recent activities' })
  @ApiOkResponse({ type: FindActivitiesResponseDto })
  findRecent(
    @Query() findActivitiesDto: FindActivitiesDto,
    @OriginalUrl() originalUrl: string,
  ) {
    return this.activitiesService.findRecent(findActivitiesDto, originalUrl);
  }
}
