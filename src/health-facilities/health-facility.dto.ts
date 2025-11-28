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
} from 'class-validator';
import { Type } from 'class-transformer';
import { PHONE_NUMBER_REGEX } from '../common/common.contants';
import { PaginationDto } from '../common/commond.dto';
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
}
