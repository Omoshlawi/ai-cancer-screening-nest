import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  Referral,
  ReferralStatus,
  TestOutcome,
} from '../../generated/prisma/client';
import { PaginationControlsDto, PaginationDto } from '../common/commond.dto';

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
}

export class UpdateReferralDto extends PartialType(
  OmitType(CreateReferralDto, ['screeningId'] as const),
) { }

export class FindReferralDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter referrals by client ID',
    example: 'clx1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiProperty({
    description: 'Filter referrals by provider ID',
    example: 'clx1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  providerId?: string;

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

  @ApiProperty({
    description: 'Generic search query',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
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

export class ReferralResponseDto implements Referral {
  @ApiProperty({
    description: 'Status of the referral',
    enum: ReferralStatus,
    example: ReferralStatus.PENDING,
  })
  status: ReferralStatus;

  @ApiProperty({
    description:
      'Indicates if transport assistance is needed for this referral',
    type: Boolean,
    example: true,
  })
  transportNeeded: boolean;

  @ApiProperty({
    description: 'Indicates if financial support is required for this referral',
    type: Boolean,
    example: false,
  })
  financialSupport: boolean;

  @ApiProperty({
    description: 'Date the referred client visited the facility, if applicable',
    type: String,
    format: 'date-time',
    example: '2024-06-20T10:00:00.000Z',
    required: false,
    nullable: true,
  })
  visitedDate: Date | null;

  @ApiProperty({
    description: 'Result of the test performed at the health facility, if any',
    enum: TestOutcome,
    example: TestOutcome.POSITIVE,
    required: false,
    nullable: true,
  })
  testResult: TestOutcome | null;

  @ApiProperty({
    description: 'Final diagnosis given at the health facility, if provided',
    type: String,
    example: 'Tuberculosis',
    required: false,
    nullable: true,
  })
  finalDiagnosis: string | null;
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

export class CompleteReferralDto {
  @ApiProperty({
    description:
      'The date patient showed up at the facility to honour referral',
    example: new Date().toISOString(),
  })
  @IsDate()
  @Type(() => Date)
  visitedDate: Date;
  @ApiProperty({ enum: TestOutcome, description: 'Results of the actual test' })
  @IsEnum(TestOutcome)
  testResult: TestOutcome;
  @ApiProperty({
    description: "Positive/Negative result isn't enough for a medical record",
    examples: ['False Positive', 'Confirmed Stage 1'],
    required: false,
  })
  @IsOptional()
  finalDiagnosis?: string;
  // For follow-up
  @ApiProperty({
    description: 'Id of followup completed by this referral',
  })
  @IsNotEmpty()
  followUpId: string;
  @ApiProperty({
    description: 'Followup outcome notes',
    required: false,
  })
  @IsOptional()
  outcomeNotes?: string;
}
