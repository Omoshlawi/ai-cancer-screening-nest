import { ApiProperty } from '@nestjs/swagger';
import { AddressHierarchy } from '../../generated/prisma/browser';
import { PaginationDto } from 'src/common/commond.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAddressHierarchyDto extends PaginationDto {
  @ApiProperty({
    description: 'Search query to filter FAQs by question or answer',
    example: 'cervical cancer',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;
  @ApiProperty({
    description: 'Country code',
    example: 'KE',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    description:
      'Level of the address hierarchy (1=county, 2=sub-county, 3=ward, etc). Min=1, Max=5',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  level?: number;

  @ApiProperty({
    description: 'Code for this location',
    example: 'KE-001-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'UUID of the parent location (may be null for top level)',
    example: '97bfa245-d51b-4ae2-928b-5b706be5b71f',
    required: false,
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({
    description: 'Name of the location in english',
    example: 'Nairobi',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Localized name of the location',
    example: 'Nairobi',
    required: false,
  })
  @IsOptional()
  @IsString()
  nameLocal?: string;

  @ApiProperty({
    description: 'Country code of the parent location',
    example: 'KE',
    required: false,
  })
  @IsOptional()
  @IsString()
  parentCountry?: string;

  @ApiProperty({
    description: 'Level of the parent location (1=county, 2=sub-county, etc)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  parentLevel?: number;

  @ApiProperty({
    description: 'Code of the parent location',
    example: 'KE-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  parentCode?: string;

  @ApiProperty({
    description: 'Name of the parent location in english',
    example: 'Nairobi',
    required: false,
  })
  @IsOptional()
  @IsString()
  parentName?: string;

  @ApiProperty({
    description: 'Localized name of the parent location',
    example: 'Nairobi',
    required: false,
  })
  @IsOptional()
  @IsString()
  parentNameLocal?: string;
}
export class GetAddressHierarchyResponseDto implements AddressHierarchy {
  @ApiProperty()
  country: string;

  @ApiProperty()
  level: number;

  @ApiProperty()
  parentId: string;

  @ApiProperty({ type: GetAddressHierarchyResponseDto })
  parent?: GetAddressHierarchyResponseDto | undefined;

  @ApiProperty({ isArray: true, type: GetAddressHierarchyResponseDto })
  children: GetAddressHierarchyResponseDto[];

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  nameLocal: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  voided: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class QueryAddressHierarchyResponseDto {
  @ApiProperty({ isArray: true, type: GetAddressHierarchyResponseDto })
  results: GetAddressHierarchyResponseDto[];

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  next: string | null;

  @ApiProperty()
  prev: string | null;
}
