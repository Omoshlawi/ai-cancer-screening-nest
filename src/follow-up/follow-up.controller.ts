import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Session,
} from '@nestjs/common';
import { RequireChp } from '../chps/chp.decorators';
import { FollowUpService } from './follow-up.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  CancelFollowUpDto,
  CreateFollowUpDto,
  FollowUpResponseDto,
  UpdateFollowUpDto,
} from './follow-up.dto';
import {
  ApiErrorsResponse,
  IpAddress,
  OriginalUrl,
  UserAgent,
} from '../common/common.decorators';
import { UserSession } from '../auth/auth.types';
import {
  CreateOutreachActionDto,
  FindOutreachActionResponseDto,
  OutreachActionsResponseDto,
} from './follow-up.outreach.dto';
import { FollowUpOutreachActionService } from './follow-up.outreach.service';
import { PaginationDto } from '../common/commond.dto';

@Controller('follow-up')
@RequireChp()
export class FollowUpController {
  constructor(
    private readonly followUpService: FollowUpService,
    private readonly outReachActionService: FollowUpOutreachActionService,
  ) {}

  @Post()
  @ApiOkResponse({ type: FollowUpResponseDto })
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Create Followup' })
  create(
    @Body() createFollowUpDto: CreateFollowUpDto,
    @Session() session: UserSession,
    @IpAddress() ipAddress: string | undefined,
    @UserAgent() userAgent: string | undefined,
  ) {
    return this.followUpService.create(
      createFollowUpDto,
      session.user,
      ipAddress,
      userAgent,
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: FollowUpResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get a follow-up by ID' })
  findOne(@Param('id') id: string, @Session() session: UserSession) {
    return this.followUpService.findOne(id, session.user);
  }

  @Put(':id')
  @ApiOkResponse({ type: FollowUpResponseDto })
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Update a follup by ID' })
  update(
    @Param('id') id: string,
    @Body() updateFollowUpDto: UpdateFollowUpDto,
    @Session() session: UserSession,
    @IpAddress() ipAddress: string | undefined,
    @UserAgent() userAgent: string | undefined,
  ) {
    return this.followUpService.update(
      id,
      updateFollowUpDto,
      session.user,
      ipAddress,
      userAgent,
    );
  }

  @Delete(':id')
  @ApiOkResponse({ type: FollowUpResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Delete a follow-up by ID' })
  delete(
    @Param('id') id: string,
    @Session() session: UserSession,
    @IpAddress() ipAddress: string | undefined,
    @UserAgent() userAgent: string | undefined,
  ) {
    return this.followUpService.delete(id, session.user, ipAddress, userAgent);
  }
  @Post(':id/cancel')
  @ApiOkResponse({ type: FollowUpResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Cancel a follow-up by ID' })
  cancel(
    @Param('id') id: string,
    @Body() canceFollowUpDto: CancelFollowUpDto,
    @Session() session: UserSession,
    @IpAddress() ipAddress: string | undefined,
    @UserAgent() userAgent: string | undefined,
  ) {
    return this.followUpService.cancel(
      id,
      canceFollowUpDto,
      session.user,
      ipAddress,
      userAgent,
    );
  }
  @Post(':id/outreach-action')
  @ApiOkResponse({ type: OutreachActionsResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Create outreach action' })
  createOutreachAction(
    @Param('id') id: string,
    @Body() createOutreachActionDto: CreateOutreachActionDto,
    @Session() session: UserSession,
    @IpAddress() ipAddress: string | undefined,
    @UserAgent() userAgent: string | undefined,
  ) {
    return this.outReachActionService.create(
      id,
      createOutreachActionDto,
      session.user,
      ipAddress,
      userAgent,
    );
  }
  @Get(':id/outreach-action')
  @ApiOkResponse({ type: FindOutreachActionResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get outreach action' })
  getOutreachAction(
    @Param('id') id: string,
    @Query() query: PaginationDto,
    @Session() session: UserSession,
    @OriginalUrl() originalUrl: string,
  ) {
    return this.outReachActionService.findAll(
      id,
      session.user,
      query,
      originalUrl,
    );
  }
}
