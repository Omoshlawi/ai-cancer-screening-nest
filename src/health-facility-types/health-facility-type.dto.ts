import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { PaginationDto, PaginationControlsDto } from '../common/commond.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHealthFacilityTypeDto {
  @ApiProperty({
    description: 'The name of the health facility type',
    example: 'Hospital',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'The description of the health facility type',
    example:
      'A large medical facility providing comprehensive healthcare services',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateHealthFacilityTypeDto {
  @ApiProperty({
    description: 'The name of the health facility type',
    example: 'Hospital',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiProperty({
    description: 'The description of the health facility type',
    example:
      'A large medical facility providing comprehensive healthcare services',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class FindHealthFacilityTypeDto extends PaginationDto {
  @ApiProperty({
    description:
      'Search query to filter health facility types by name or description',
    example: 'hospital',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;
}

export class HealthFacilityItemResponseDto {
  @ApiProperty({
    description: 'The ID of the health facility',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the health facility',
    example: 'Kenyatta National Hospital',
  })
  name: string;

  @ApiProperty({
    description: 'The address of the health facility',
    example: 'Hospital Road, Nairobi, Kenya',
  })
  address: string;
}

export class HealthFacilityTypeResponseDto {
  @ApiProperty({
    description: 'The ID of the health facility type',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the health facility type',
    example: 'Hospital',
  })
  name: string;

  @ApiProperty({
    description: 'The description of the health facility type',
    example:
      'A large medical facility providing comprehensive healthcare services',
    required: false,
  })
  description: string | null;

  @ApiProperty({
    description: 'The list of health facilities of this type',
    type: [HealthFacilityItemResponseDto],
  })
  healthFacilities: HealthFacilityItemResponseDto[];

  @ApiProperty({
    description: 'The creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class FindHealthFacilityTypeResponseDto extends PaginationControlsDto {
  @ApiProperty({
    description: 'The list of health facility types',
    type: [HealthFacilityTypeResponseDto],
  })
  results: HealthFacilityTypeResponseDto[];
}
