import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ChpsService } from './chps.service';
import { CreateChpDto, FindChpDto } from './chp.dto';
import { ApiErrorsResponse, OriginalUrl } from '../common/common.decorators';
import { ApiOperation } from '@nestjs/swagger';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { RequireSystemPermission } from '../auth/auth.decorators';

@Controller('chps')
export class ChpsController {
  constructor(private readonly chpsService: ChpsService) {}
  @Get()
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get all community health providers(CHPs)' })
  @OptionalAuth()
  findAll(@Query() findChpDto: FindChpDto, @OriginalUrl() originalUrl: string) {
    return this.chpsService.findAll(findChpDto, originalUrl);
  }

  @Post()
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Create a new community health provider(CHP)' })
  @OptionalAuth()
  @RequireSystemPermission({
    chp: ['create'],
  })
  create(@Body() createChpDto: CreateChpDto) {
    return this.chpsService.create(createChpDto);
  }
}
