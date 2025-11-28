import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Session,
} from '@nestjs/common';
import { RequireChp } from '../chps/chp.decorators';
import { ScreeningsService } from './screenings.service';
import {
  FindScreeningsDto,
  FindScreeningsResponseDto,
  ScreenClientDto,
  ScreeningDto,
} from './screenings.dto';
import { UserSession } from '../auth/auth.types';
import { ApiErrorsResponse, OriginalUrl } from '../common/common.decorators';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('screenings')
@RequireChp()
export class ScreeningsController {
  constructor(private readonly screeningsService: ScreeningsService) {}

  @Get()
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get all screenings' })
  @ApiOkResponse({ type: FindScreeningsResponseDto })
  @ApiErrorsResponse()
  findAll(
    @Query() findScreeningsDto: FindScreeningsDto,
    @OriginalUrl() originalUrl: string,
    @Session() session: UserSession,
  ) {
    return this.screeningsService.findAll(
      findScreeningsDto,
      originalUrl,
      session.user,
    );
  }

  @Post()
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Create a new screening' })
  @ApiOkResponse({ type: ScreeningDto })
  @ApiErrorsResponse({ badRequest: true })
  create(
    @Body() screenClientDto: ScreenClientDto,
    @Session() session: UserSession,
  ) {
    return this.screeningsService.create(screenClientDto, session.user);
  }

  @Get(':id')
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get a screening by ID' })
  @ApiOkResponse({ type: ScreeningDto })
  @ApiErrorsResponse()
  findOne(@Param('id') id: string) {
    return this.screeningsService.findOne(id);
  }
}
