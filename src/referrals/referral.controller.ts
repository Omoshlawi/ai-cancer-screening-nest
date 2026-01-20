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
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Session } from '@thallesp/nestjs-better-auth';
import { UserSession } from '../auth/auth.types';
import { RequireChp } from '../chps/chp.decorators';
import {
  ApiErrorsResponse,
  IpAddress,
  OriginalUrl,
  UserAgent,
} from '../common/common.decorators';
import {
  CompleteReferralDto,
  CreateReferralDto,
  FindReferralDto,
  FindReferralResponseDto,
  ReferralResponseDto,
  UpdateReferralDto,
} from './referral.dto';
import { ReferralService } from './referral.service';

@Controller('referrals')
@RequireChp()
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Post()
  @ApiOkResponse({ type: ReferralResponseDto })
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Create a new referral' })
  create(
    @Body() createReferralDto: CreateReferralDto,
    @Session() session: UserSession,
    @IpAddress() ipAddress: string | undefined,
    @UserAgent() userAgent: string | undefined,
  ) {
    return this.referralService.create(
      createReferralDto,
      session.user,
      ipAddress,
      userAgent,
    );
  }

  @Get()
  @ApiOkResponse({ type: FindReferralResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get all referrals for the current CHP' })
  findAll(
    @Query() findReferralDto: FindReferralDto,
    @OriginalUrl() originalUrl: string,
    @Session() session: UserSession,
  ) {
    return this.referralService.findAll(
      findReferralDto,
      originalUrl,
      session.user,
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: ReferralResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get a referral by ID' })
  findOne(@Param('id') id: string, @Session() session: UserSession) {
    return this.referralService.findOne(id, session.user);
  }

  @Put(':id')
  @ApiOkResponse({ type: ReferralResponseDto })
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Update a referral by ID' })
  update(
    @Param('id') id: string,
    @Body() updateReferralDto: UpdateReferralDto,
    @Session() session: UserSession,
    @IpAddress() ipAddress: string | undefined,
    @UserAgent() userAgent: string | undefined,
  ) {
    return this.referralService.update(
      id,
      updateReferralDto,
      session.user,
      ipAddress,
      userAgent,
    );
  }

  @Delete(':id')
  @ApiOkResponse({ type: ReferralResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Delete a referral by ID' })
  delete(
    @Param('id') id: string,
    @Session() session: UserSession,
    @IpAddress() ipAddress: string | undefined,
    @UserAgent() userAgent: string | undefined,
  ) {
    return this.referralService.delete(id, session.user, ipAddress, userAgent);
  }

  @Post(':id/complete')
  @ApiOkResponse({ type: ReferralResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Complete Referral' })
  complete(
    @Param('id') id: string,
    @Body() completeReferralDto: CompleteReferralDto,
    @Session() session: UserSession,
    @IpAddress() ipAddress: string | undefined,
    @UserAgent() userAgent: string | undefined,
  ) {
    return this.referralService.complete(
      id,
      completeReferralDto,
      session.user,
      ipAddress,
      userAgent,
    );
  }

  @Post(':id/cancel')
  @ApiOkResponse({ type: ReferralResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Cancel a referral' })
  cancel(
    @Param('id') id: string,
    @Session() session: UserSession,
    @IpAddress() ipAddress: string | undefined,
    @UserAgent() userAgent: string | undefined,
  ) {
    return this.referralService.cancel(id, session.user, ipAddress, userAgent);
  }
}
