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
import { FaqTopicService } from './faq-topic.service';
import {
  CreateFaqTopicDto,
  FindFaqTopicDto,
  UpdateFaqTopicDto,
  FaqTopicResponseDto,
  FindFaqTopicResponseDto,
} from './faq-topic.dto';
import { ApiErrorsResponse, OriginalUrl } from '../common/common.decorators';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { RequireSystemPermission } from '../auth/auth.decorators';

@Controller('faq-topics')
export class FaqTopicController {
  constructor(private readonly faqTopicService: FaqTopicService) {}

  @Post()
  @ApiOkResponse({ type: FaqTopicResponseDto })
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Create a new FAQ topic' })
  @RequireSystemPermission({
    faqTopic: ['create'],
  })
  create(@Body() createFaqTopicDto: CreateFaqTopicDto) {
    return this.faqTopicService.create(createFaqTopicDto);
  }

  @Get()
  @ApiOkResponse({ type: FindFaqTopicResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get all FAQ topics' })
  @OptionalAuth()
  findAll(
    @Query() findFaqTopicDto: FindFaqTopicDto,
    @OriginalUrl() originalUrl: string,
  ) {
    return this.faqTopicService.findAll(findFaqTopicDto, originalUrl);
  }

  @Get(':id')
  @ApiOkResponse({ type: FaqTopicResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get a FAQ topic by ID' })
  @OptionalAuth()
  findOne(@Param('id') id: string) {
    return this.faqTopicService.findOne(id);
  }

  @Put(':id')
  @ApiOkResponse({ type: FaqTopicResponseDto })
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Update a FAQ topic by ID' })
  @RequireSystemPermission({
    faqTopic: ['update'],
  })
  update(
    @Param('id') id: string,
    @Body() updateFaqTopicDto: UpdateFaqTopicDto,
  ) {
    return this.faqTopicService.update(id, updateFaqTopicDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: FaqTopicResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Delete a FAQ topic by ID' })
  @RequireSystemPermission({
    faqTopic: ['delete'],
  })
  delete(@Param('id') id: string) {
    return this.faqTopicService.delete(id);
  }
}
