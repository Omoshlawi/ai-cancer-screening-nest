import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEmail,
  ValidateNested,
  IsNumber,
  IsLatitude,
  IsLongitude,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PHONE_NUMBER_REGEX } from '../common/common.contants';
import { PaginationDto, PaginationControlsDto } from '../common/commond.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class CoordinatesDto {
  @ApiProperty({ description: 'Latitude', example: -1.2921 })
  @IsNotEmpty()
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiProperty({ description: 'Longitude', example: 36.8219 })
  @IsNotEmpty()
  @IsNumber()
  @IsLongitude()
  longitude: number;
}

export class CreateHealthFacilityDto {
  @ApiProperty({
    description: 'The name of the health facility',
    example: 'Kenyatta National Hospital',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'The address of the health facility',
    example: 'Hospital Road, Nairobi, Kenya',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  address: string;

  @ApiProperty({
    description: 'The phone number of the health facility',
    example: '+254712345678',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(PHONE_NUMBER_REGEX, {
    message: 'Phone number must be a valid Kenyan phone number',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'The email of the health facility',
    example: 'info@knh.ac.ke',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The logo URL of the health facility',
    example: 'https://example.com/logo.png',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  logo: string;

  @ApiProperty({
    description: 'Geolocation coordinates',
    type: CoordinatesDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;

  @ApiProperty({
    description: 'The ID of the health facility type (optional)',
    example: 'clx1234567890',
    required: true,
  })
  @IsOptional()
  @IsString()
  typeId: string;
}

export class UpdateHealthFacilityDto {
  @ApiProperty({
    description: 'The name of the health facility',
    example: 'Kenyatta National Hospital',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiProperty({
    description: 'The address of the health facility',
    example: 'Hospital Road, Nairobi, Kenya',
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  address?: string;

  @ApiProperty({
    description: 'The phone number of the health facility',
    example: '+254712345678',
  })
  @IsOptional()
  @IsString()
  @Matches(PHONE_NUMBER_REGEX, {
    message: 'Phone number must be a valid Kenyan phone number',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'The email of the health facility',
    example: 'info@knh.ac.ke',
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'The logo URL of the health facility',
    example: 'https://example.com/logo.png',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  logo?: string;

  @ApiProperty({
    description: 'Geolocation coordinates',
    type: CoordinatesDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;

  @ApiProperty({
    description: 'The ID of the health facility type (optional)',
    example: 'clx1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  typeId?: string;
}

export class FindHealthFacilityDto extends PaginationDto {
  @ApiProperty({
    description:
      'Search query to filter health facilities by name, address, or email',
    example: 'Kenyatta',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;

  @ApiProperty({
    description: 'The name of the health facility',
    example: 'Kenyatta National Hospital',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'The email of the health facility',
    example: 'info@knh.ac.ke',
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'The type ID of the health facility',
    example: 'clx1234567890',
  })
  @IsOptional()
  @IsString()
  typeId?: string;
}

export class FindNearestHealthFacilityDto {
  @ApiProperty({
    description: 'Latitude of the location',
    example: -1.2921,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  lat: number;

  @ApiProperty({
    description: 'Longitude of the location',
    example: 36.8219,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  lng: number;

  @ApiProperty({
    description: 'Number of nearest facilities to return',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 50,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  targetCount?: number;

  @ApiProperty({
    description: 'Maximum search radius in kilometers (safety limit)',
    example: 1000,
    default: 1000,
    minimum: 1,
    maximum: 5000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5000)
  maxDistanceKm?: number;

  @ApiProperty({
    description: 'Initial search radius in kilometers',
    example: 5,
    default: 5,
    minimum: 0.1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(100)
  initialDistanceKm?: number;

  @ApiProperty({
    description: 'Distance increment in kilometers for each iteration',
    example: 5,
    default: 5,
    minimum: 0.1,
    maximum: 50,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(50)
  distanceIncrementKm?: number;

  @ApiProperty({
    description:
      'Multiplier for fetching facilities (to account for distance filtering). Higher values fetch more candidates but may be slower.',
    example: 3,
    default: 3,
    minimum: 1,
    maximum: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  fetchMultiplier?: number;

  @ApiProperty({
    description: 'Filter facilities by health facility type ID',
    example: 'clx1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  typeId?: string;
}

export class ReferralItemResponseDto {
  @ApiProperty({
    description: 'The ID of the referral',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({ description: 'The screening ID', example: 'clx1234567890' })
  screeningId: string;

  @ApiProperty({
    description: 'The appointment time',
    example: '2024-01-01T00:00:00.000Z',
  })
  appointmentTime: Date;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Please bring your ID',
    required: false,
  })
  additionalNotes: string | null;

  @ApiProperty({
    description: 'The health facility ID',
    example: 'clx1234567890',
  })
  healthFacilityId: string;

  @ApiProperty({ description: 'The referral status', example: 'PENDING' })
  status: string;

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

export class HealthFacilityTypeItemResponseDto {
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
}

export class HealthFacilityResponseDto {
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

  @ApiProperty({
    description: 'The phone number of the health facility',
    example: '+254712345678',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'The email of the health facility',
    example: 'info@knh.ac.ke',
  })
  email: string;

  @ApiProperty({
    description: 'The logo URL of the health facility',
    example: 'https://example.com/logo.png',
  })
  logo: string;

  @ApiProperty({
    description: 'Geolocation coordinates',
    type: CoordinatesDto,
  })
  coordinates: CoordinatesDto;

  @ApiProperty({
    description: 'The type ID (optional)',
    example: 'clx1234567890',
    required: false,
  })
  typeId: string | null;

  @ApiProperty({
    description: 'The health facility type (if associated)',
    type: HealthFacilityTypeItemResponseDto,
    required: false,
  })
  type: HealthFacilityTypeItemResponseDto | null;

  @ApiProperty({
    description: 'The list of referrals for this health facility',
    type: [ReferralItemResponseDto],
  })
  referrals: ReferralItemResponseDto[];

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

export class NearestHealthFacilityResponseDto extends HealthFacilityResponseDto {
  @ApiProperty({
    description: 'Distance to the health facility in kilometers',
    example: 5.2,
  })
  distanceKm: number;
}

export class FindNearestHealthFacilityResponseDto {
  @ApiProperty({
    description:
      'The list of nearest health facilities sorted by distance (nearest to furthest)',
    type: [NearestHealthFacilityResponseDto],
    example: [
      {
        id: 'clx1234567890',
        name: 'Kenyatta National Hospital',
        address: 'Hospital Road, Nairobi, Kenya',
        phoneNumber: '+254712345678',
        email: 'info@knh.ac.ke',
        logo: 'https://example.com/logo.png',
        coordinates: {
          latitude: -1.2921,
          longitude: 36.8219,
        },
        typeId: 'clx9876543210',
        type: {
          id: 'clx9876543210',
          name: 'Hospital',
          description: 'A large medical facility',
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        distanceKm: 2.5,
      },
    ],
  })
  results: NearestHealthFacilityResponseDto[];
}

export class FindHealthFacilityResponseDto extends PaginationControlsDto {
  @ApiProperty({
    description: 'The list of health facilities',
    type: [HealthFacilityResponseDto],
  })
  results: HealthFacilityResponseDto[];
}
