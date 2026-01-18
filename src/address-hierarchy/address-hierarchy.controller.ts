import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { ApiErrorsResponse, OriginalUrl } from '../common/common.decorators';
import {
  FindAddressHierarchyDto,
  GetAddressHierarchyResponseDto,
  QueryAddressHierarchyResponseDto,
} from './address-hierarchy.dto';
import { AddressHierarchyService } from './address-hierarchy.service';

@Controller('address-hierarchy')
export class AddressHierarchyController {
  constructor(
    private readonly addressHierarchyService: AddressHierarchyService,
  ) {}

  @Get('/')
  @OptionalAuth()
  @ApiOperation({ summary: 'Query AddressHierarchy' })
  @ApiOkResponse({ type: QueryAddressHierarchyResponseDto })
  @ApiErrorsResponse()
  queryAddressHierarchy(
    @Query() query: FindAddressHierarchyDto,
    @OriginalUrl() originalUrl: string,
  ) {
    return this.addressHierarchyService.findAll(query, originalUrl);
  }

  @Delete('/:id')
  //   @RequireSystemPermission({ addressHierarchy: ['delete'] })
  @ApiOperation({ summary: 'Delete AddressHierarchy' })
  @ApiOkResponse({ type: GetAddressHierarchyResponseDto })
  @ApiErrorsResponse()
  deleteAddressHierarchy(@Param('id', ParseUUIDPipe) id: string) {
    return this.addressHierarchyService.delete(id);
  }
}
