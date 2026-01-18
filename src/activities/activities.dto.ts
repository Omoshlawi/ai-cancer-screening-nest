import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JsonValue } from '@prisma/client/runtime/client';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationControlsDto, PaginationDto } from '../common/commond.dto';

export class CreateActivityDto {
  @ApiProperty({
    description: 'The action performed',
    example: 'create',
  })
  @IsNotEmpty()
  @IsString()
  action: string;

  @ApiProperty({
    description: 'The resource type',
    example: 'screening',
  })
  @IsNotEmpty()
  @IsString()
  resource: string;

  @ApiPropertyOptional({
    description: 'The ID of the affected resource',
    example: 'clx1234567890',
  })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata about the activity',
    example: { clientId: 'clx1234567890', score: 85 },
  })
  @IsOptional()
  metadata?: JsonValue;
}

export class FindActivitiesDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by user ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by action',
    required: false,
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    description: 'Filter by resource type',
    required: false,
  })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiPropertyOptional({
    description: 'Filter by resource ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({
    description: 'Filter activities from this date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter activities to this date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

export class ActivityDto {
  @ApiProperty({ description: 'The CUID of the activity' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'The user ID who performed the activity' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'The action performed', example: 'create' })
  @IsString()
  action: string;

  @ApiProperty({
    description: 'The resource type',
    example: 'screening',
  })
  @IsString()
  resource: string;

  @ApiPropertyOptional({
    description: 'The ID of the affected resource',
    example: 'clx1234567890',
  })
  @IsOptional()
  @IsString()
  resourceId?: string | null;

  @ApiPropertyOptional({
    description: 'Additional metadata about the activity',
  })
  @IsOptional()
  metadata?: JsonValue | null;

  @ApiPropertyOptional({
    description: 'Human-readable description of the activity',
    example: 'Created a new screening',
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    description: 'IP address of the user',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string | null;

  @ApiPropertyOptional({
    description: 'User agent of the request',
  })
  @IsOptional()
  @IsString()
  userAgent?: string | null;

  @ApiProperty({ description: 'Created at' })
  @IsDateString()
  createdAt: Date;
}

export class FindActivitiesResponseDto extends PaginationControlsDto {
  @ApiProperty({
    description: 'The list of activities',
    type: [ActivityDto],
  })
  results: ActivityDto[];
}
