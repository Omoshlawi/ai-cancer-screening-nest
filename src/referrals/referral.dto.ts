import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationControlsDto, PaginationDto } from '../common/commond.dto';

export enum ReferralStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateReferralDto {
  @ApiProperty({
    description: 'The ID of the screening',
    example: 'clx1234567890',
  })
  @IsNotEmpty()
  @IsString()
  screeningId: string;

  @ApiProperty({
    description: 'The appointment time',
    example: '2024-12-25T10:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  appointmentTime: string;

  @ApiProperty({
    description: 'Additional notes for the referral',
    example: 'Please bring your ID and previous test results',
    required: false,
  })
  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @ApiProperty({
    description: 'The ID of the health facility',
    example: 'clx1234567890',
  })
  @IsNotEmpty()
  @IsString()
  healthFacilityId: string;

  @ApiProperty({
    description: 'The status of the referral',
    enum: ReferralStatus,
    example: ReferralStatus.PENDING,
    default: ReferralStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ReferralStatus)
  status?: ReferralStatus;
}

export class UpdateReferralDto {
  @ApiProperty({
    description: 'The appointment time',
    example: '2024-12-25T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  appointmentTime?: string;

  @ApiProperty({
    description: 'Additional notes for the referral',
    example: 'Please bring your ID and previous test results',
    required: false,
  })
  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @ApiProperty({
    description: 'The ID of the health facility',
    example: 'clx1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  healthFacilityId?: string;

  @ApiProperty({
    description: 'The status of the referral',
    enum: ReferralStatus,
    example: ReferralStatus.COMPLETED,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReferralStatus)
  status?: ReferralStatus;
}

export class FindReferralDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter referrals by screening ID',
    example: 'clx1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  screeningId?: string;

  @ApiProperty({
    description: 'Filter referrals by health facility ID',
    example: 'clx1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  healthFacilityId?: string;

  @ApiProperty({
    description: 'Filter referrals by status',
    enum: ReferralStatus,
    example: ReferralStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReferralStatus)
  status?: ReferralStatus;
}

export class ScreeningItemResponseDto {
  @ApiProperty({
    description: 'The ID of the screening',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'The client ID',
    example: 'clx1234567890',
  })
  clientId: string;

  @ApiProperty({
    description: 'The provider ID',
    example: 'clx1234567890',
  })
  providerId: string;
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
}

export class ReferralResponseDto {
  @ApiProperty({
    description: 'The ID of the referral',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'The screening ID',
    example: 'clx1234567890',
  })
  screeningId: string;

  @ApiProperty({
    description: 'The screening information',
    type: ScreeningItemResponseDto,
  })
  screening: ScreeningItemResponseDto;

  @ApiProperty({
    description: 'The appointment time',
    example: '2024-12-25T10:00:00.000Z',
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

  @ApiProperty({
    description: 'The health facility information',
    type: HealthFacilityItemResponseDto,
  })
  healthFacility: HealthFacilityItemResponseDto;

  @ApiProperty({
    description: 'The referral status',
    enum: ReferralStatus,
    example: ReferralStatus.PENDING,
  })
  status: ReferralStatus;

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

export class FindReferralResponseDto extends PaginationControlsDto {
  @ApiProperty({
    description: 'The list of referrals',
    type: [ReferralResponseDto],
  })
  results: ReferralResponseDto[];
}
