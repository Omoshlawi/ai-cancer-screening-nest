import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationControls } from './common.types';

class ZodFieldError {
  @ApiProperty({
    type: [String],
    description: 'Array of error messages for this field',
    example: ['Required'],
  })
  _errors: string[];

  // Allow nested field errors (index signature without decorator)
  [key: string]: string[] | ZodFieldError;
}

export class HttpBadRequestResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({
    type: ZodFieldError,
    description: 'Zod formatted validation errors',
    example: {
      _errors: [],
      field1Name: {
        _errors: ['Required'],
      },
      field2Name: {
        _errors: [],
        nestedField1Name: {
          _errors: ['Required'],
        },
        nestedField2Name: {
          _errors: ['Required'],
        },
      },
    },
  })
  errors?: ZodFieldError;
}

export class HttpInternalServerErrorResponseDto {
  @ApiProperty({ example: 500 })
  statusCode: number;

  @ApiProperty({ example: 'Internal server error' })
  message: string;
}

export class HttpNotFoundErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Not found' })
  message: string;
}
export class HttpUnauthorizedErrorResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Unauthorized request' })
  message: string;
}
export class HttpFobbidenErrorResponseDto {
  @ApiProperty({ example: 403 })
  statusCode: number;

  @ApiProperty({ example: 'Fobbiden request' })
  message: string;
}

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (starts from 1)',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  limit?: number;
}

export class PaginationControlsDto implements PaginationControls {
  @ApiProperty({
    description: 'The number of items per page',
    example: 12,
    minimum: 0,
    required: false,
  })
  @IsInt()
  pageSize: number;

  @ApiProperty({
    description: 'The total number of pages',
    example: 10,
    minimum: 0,
    required: false,
  })
  @IsInt()
  totalPages: number;

  @ApiProperty({
    description: 'The total number of items',
    example: 100,
    minimum: 0,
    required: false,
  })
  @IsInt()
  totalCount: number;

  @ApiProperty({
    description: 'The next page URL',
    example: '/items?page=2&limit=12',
    required: false,
  })
  @IsString()
  next: string | null;

  @ApiProperty({
    description: 'The previous page URL',
    example: '/items?page=1&limit=12',
    required: false,
  })
  @IsString()
  prev: string | null;

  @ApiProperty({
    description: 'The current page',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsInt()
  currentPage: number;
}
