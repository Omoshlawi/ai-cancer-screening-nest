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
import { FaqService } from './faq.service';
import {
  CreateFaqDto,
  FindFaqDto,
  UpdateFaqDto,
  FaqResponseDto,
  FindFaqResponseDto,
} from './faq.dto';
import { ApiErrorsResponse, OriginalUrl } from '../common/common.decorators';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { RequireSystemPermission } from '../auth/auth.decorators';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  @ApiOkResponse({ type: FaqResponseDto })
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Create a new FAQ' })
  @RequireSystemPermission({
    faq: ['create'],
  })
  create(@Body() createFaqDto: CreateFaqDto) {
    return this.faqService.create(createFaqDto);
  }

  @Get()
  @ApiOkResponse({ type: FindFaqResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get all FAQs' })
  @OptionalAuth()
  findAll(@Query() findFaqDto: FindFaqDto, @OriginalUrl() originalUrl: string) {
    return this.faqService.findAll(findFaqDto, originalUrl);
  }

  @Get(':id')
  @ApiOkResponse({ type: FaqResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Get a FAQ by ID' })
  @OptionalAuth()
  findOne(@Param('id') id: string) {
    return this.faqService.findOne(id);
  }

  @Put(':id')
  @ApiOkResponse({ type: FaqResponseDto })
  @ApiErrorsResponse({ badRequest: true })
  @ApiOperation({ summary: 'Update a FAQ by ID' })
  @RequireSystemPermission({
    faq: ['update'],
  })
  update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
    return this.faqService.update(id, updateFaqDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: FaqResponseDto })
  @ApiErrorsResponse()
  @ApiOperation({ summary: 'Delete a FAQ by ID' })
  @RequireSystemPermission({
    faq: ['delete'],
  })
  delete(@Param('id') id: string) {
    return this.faqService.delete(id);
  }
}
