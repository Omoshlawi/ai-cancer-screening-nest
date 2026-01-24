import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import {
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { FollowUp } from '../../generated/prisma/client';
import {
  CancelReason,
  FollowUpCategory,
  Priority,
} from '../../generated/prisma/enums';
import { PaginationControlsDto, PaginationDto } from '../common/commond.dto';
import { Type } from 'class-transformer';

export class CreateFollowUpDto {
  @ApiProperty({
    description: 'The ID of the refreral',
    example: 'clx1234567890',
    required: false,
  })
  @IsOptional()
  referralId?: string;
  @ApiProperty({
    description: 'The ID of the screening',
    example: 'clx1234567890',
  })
  @IsNotEmpty()
  screeningId: string;
  @ApiProperty({
    description: 'The follow-up category',
    example: FollowUpCategory.REFERRAL_ADHERENCE,
    enum: FollowUpCategory,
  })
  @IsEnum(FollowUpCategory)
  category: FollowUpCategory;
  @ApiProperty({
    description: 'Followup priority',
    example: Priority.MEDIUM,
    enum: Priority,
  })
  @IsEnum(Priority)
  priority?: Priority;
  @ApiProperty({
    description: 'The appointment time',
    example: new Date().toISOString(),
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;
  @ApiProperty({
    description: 'Date the followup is due(Deadline)',
    example: new Date().toISOString(),
  })
  @IsNotEmpty()
  @IsDateString()
  dueDate: string;
}

export class UpdateFollowUpDto extends PartialType(
  PickType(CreateFollowUpDto, ['dueDate', 'priority', 'startDate'] as const),
) {}

export class FollowUpResponseDto implements FollowUp {
  @ApiProperty({
    description: 'The ID of the client',
    example: 'clx1234567890',
    type: String,
  })
  clientId: string;

  @ApiProperty({
    description: 'The ID of the referral, if applicable',
    example: 'clx1234567890',
    type: String,
    required: false,
    nullable: true,
  })
  referralId: string | null;

  @ApiProperty({
    description: 'The follow-up category',
    enum: FollowUpCategory,
    example: FollowUpCategory.REFERRAL_ADHERENCE,
  })
  category: FollowUpCategory;

  @ApiProperty({
    description: 'Follow-up priority',
    enum: Priority,
    example: Priority.MEDIUM,
  })
  priority: Priority;

  @ApiProperty({
    description: 'The date and time when the follow-up starts',
    example: '2024-06-19T10:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  startDate: Date;

  @ApiProperty({
    description: 'The deadline for the follow-up (due date)',
    example: '2024-06-25T17:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  dueDate: Date;

  @ApiProperty({
    description: 'The unique identifier for the follow-up',
    example: 'clfu1234567890',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'The ID of the provider handling the follow-up',
    example: 'clpr9876543210',
    type: String,
  })
  providerId: string;

  @ApiProperty({
    description: 'The ID of the screening that triggered this follow-up',
    example: 'clsc11122334455',
    type: String,
  })
  triggerScreeningId: string;

  @ApiProperty({
    description: 'The date and time the follow-up was completed',
    example: '2024-06-26T12:00:00.000Z',
    type: String,
    format: 'date-time',
    required: false,
    nullable: true,
  })
  completedAt: Date | null;

  @ApiProperty({
    description: 'Notes regarding the outcome of the follow-up',
    example:
      'Client referred to specialist and follow-up completed successfully.',
    type: String,
    required: false,
    nullable: true,
  })
  outcomeNotes: string | null;

  @ApiProperty({
    description:
      'The ID of the screening that resolved this follow-up, if applicable',
    example: 'clsc99988877766',
    type: String,
    required: false,
    nullable: true,
  })
  resolvingScreeningId: string | null;

  @ApiProperty({
    description: 'Reason for follow-up cancellation, if canceled',
    enum: CancelReason,
    example: CancelReason.DECEASED,
    required: false,
    nullable: true,
  })
  cancelReason: CancelReason | null;

  @ApiProperty({
    description: 'Additional notes regarding cancellation of the follow-up',
    example: 'Client moved to another provider.',
    type: String,
    required: false,
    nullable: true,
  })
  cancelNotes: string | null;

  @ApiProperty({
    description: 'The date and time the follow-up was canceled',
    example: '2024-06-20T09:30:00.000Z',
    type: String,
    format: 'date-time',
    required: false,
    nullable: true,
  })
  canceledAt: Date | null;

  @ApiProperty({
    description: 'Timestamp for when the follow-up record was created',
    example: '2024-06-15T14:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp for when the follow-up record was last updated',
    example: '2024-06-17T18:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}

export class FindFollowUpDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter by client ID',
    example: 'clx1234567890',
    required: false,
  })
  @IsOptional()
  clientId?: string;
  @ApiProperty({
    description: 'Filter by referral ID',
    example: 'rfx1234567890',
    required: false,
  })
  @IsOptional()
  referralId?: string;
  @ApiProperty({
    description: 'Filter by screening ID that triggered the follow-up',
    example: 'scx0987654321',
    required: false,
  })
  @IsOptional()
  triggerScreeningId?: string;
  @ApiProperty({
    description:
      'Filter by follow-up category (e.g., REFERRAL_ADHERENCE, RE_SCREENING_RECALL)',
    example: FollowUpCategory.REFERRAL_ADHERENCE,
    enum: FollowUpCategory,
    required: false,
  })
  @IsOptional()
  @IsEnum(FollowUpCategory)
  category?: FollowUpCategory;
  @ApiProperty({
    description: 'Filter by follow-up priority (e.g., HIGH, MEDIUM, LOW)',
    example: Priority.MEDIUM,
    enum: Priority,
    required: false,
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
  @ApiProperty({
    description:
      'Start filtering follow-ups on or after this date (start date range lower bound)',
    example: '2024-06-01T00:00:00.000Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDateFrom?: Date;
  @ApiProperty({
    description:
      'Start filtering follow-ups on or before this date (start date range upper bound)',
    example: '2024-06-30T23:59:59.999Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDateTo?: Date;
  @ApiProperty({
    description:
      'Filter for follow-ups due on or after this date (due date range lower bound)',
    example: '2024-07-01T00:00:00.000Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDateFrom?: Date;
  @ApiProperty({
    description:
      'Filter for follow-ups due on or before this date (due date range upper bound)',
    example: '2024-07-31T23:59:59.999Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDateTo?: Date;
  @ApiProperty({
    description: 'Filter for follow-ups completed on or after this date',
    example: '2024-06-15T00:00:00.000Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completionDateFrom?: Date;
  @ApiProperty({
    description: 'Filter for follow-ups completed on or before this date',
    example: '2024-06-20T23:59:59.999Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completionDateTo?: Date;
  @ApiProperty({
    description: 'Filter for follow-ups canceled on or after this date',
    example: '2024-06-01T00:00:00.000Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cancelationDateFrom?: Date;

  @ApiProperty({
    description: 'Filter for follow-ups canceled on or before this date',
    example: '2024-06-15T23:59:59.999Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cancelationDateTo?: Date;
  @ApiProperty({
    description:
      'Filter for follow-ups resolved by a specific screening (resolving screening id)',
    example: 'scrn_xxxxxxxx',
    required: false,
  })
  @IsOptional()
  resolvingScreeningId?: string;
}
export class FindFollowUpResponseDto extends PaginationControlsDto {
  @ApiProperty({
    description: 'The list of referrals',
    isArray: true,
    type: FollowUpResponseDto,
  })
  results: FollowUpResponseDto[];
}

export class CancelFollowUpDto {
  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: new Date().toISOString() })
  canceledAt: Date;
  @IsOptional()
  @ApiProperty({ example: 'Client Died on 17th Oct 2023', required: false })
  cancelNotes?: string;
  @IsEnum(CancelReason)
  @ApiProperty({ enum: CancelReason, example: CancelReason.DECEASED })
  cancelReason: CancelReason;
}

export class CompleteFollowUpDto {
  @ApiProperty({ required: false })
  @IsOptional()
  outcomeNotes?: string;
}
