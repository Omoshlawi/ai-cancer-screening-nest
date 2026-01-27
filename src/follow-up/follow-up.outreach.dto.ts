import { IsDate, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { OutreachOutcome, OutreachType } from '../../generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OutreachAction } from '../../generated/prisma/client';
import { PaginationControlsDto } from 'src/common/commond.dto';

export class CreateOutreachActionDto {
  @ApiProperty({ enum: OutreachType, example: OutreachType.PHONE_CALL })
  @IsEnum(OutreachType)
  actionType: OutreachType;
  @ApiProperty({ example: new Date().toISOString() })
  @IsDate()
  @Type(() => Date)
  actionDate: Date;
  @ApiProperty({ enum: OutreachOutcome, example: OutreachOutcome.LOST_CONTACT })
  @IsEnum(OutreachOutcome)
  outcome: OutreachOutcome;
  @ApiProperty({
    description: 'Location address for home visits',
    required: false,
  })
  @IsOptional()
  location?: string;
  @ApiProperty({ description: 'Duration in minutes spent', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  duration?: number;
  @ApiProperty({
    required: false,
    description: 'What was discussed, patient response',
  })
  @IsOptional()
  notes?: string;
  @ApiProperty({
    description: "Why patient hasn't visited (cost, transport, fear, etc.)",
    required: false,
  })
  @IsOptional()
  barriers?: string;
  @ApiProperty({
    description: 'When CHP plans next contact',
    required: false,
    example: new Date().toISOString(),
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  nextPlannedDate?: Date;
}

export class OutreachActionsResponseDto implements OutreachAction {
  @ApiProperty({ enum: OutreachType, example: OutreachType.PHONE_CALL })
  actionType: OutreachType;
  @ApiProperty({
    description: 'Date and time of the outreach action',
    example: new Date().toISOString(),
    type: String,
    format: 'date-time',
  })
  actionDate: Date;

  @ApiProperty({
    enum: OutreachOutcome,
    description:
      'Outcome of the outreach action (e.g., PATIENT_UNAVAILABLE, BARRIER_IDENTIFIED)',
    example: OutreachOutcome.PATIENT_UNAVAILABLE,
  })
  outcome: OutreachOutcome;

  @ApiProperty({
    description: 'Location address for home visits (if applicable)',
    example: '123 Main St, Nairobi',
    required: false,
    nullable: true,
  })
  location: string | null;

  @ApiProperty({
    description: 'Duration in minutes spent on the outreach action',
    example: 15,
    required: false,
    nullable: true,
  })
  duration: number | null;

  @ApiProperty({
    description: 'Details of what was discussed, patient response, notes, etc.',
    example: 'Patient reports difficulty traveling to the hospital due to cost',
    required: false,
    nullable: true,
  })
  notes: string | null;

  @ApiProperty({
    description:
      'Barriers identified during outreach (e.g., cost, transport, fear)',
    example: 'Transport issues, cannot afford fare',
    required: false,
    nullable: true,
  })
  barriers: string | null;

  @ApiProperty({
    description: 'Next planned date for contact',
    example: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    required: false,
    nullable: true,
    type: String,
    format: 'date-time',
  })
  nextPlannedDate: Date | null;

  @ApiProperty({
    description: 'Whether the action was verified at the health facility',
    example: false,
  })
  verifiedAtFacility: boolean;

  @ApiProperty({
    description: 'Unique identifier for the outreach action',
    example: 'ckz8d2u9e002cjyvw8oh8er0r',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the follow-up this action is associated with',
    example: 'ckz8d2kwf002bjyvwdsz4ue0r',
  })
  followUpId: string;

  @ApiProperty({
    description: 'Photo filename or URL showing evidence in hospital register',
    example: 'register-photo-834756.png',
    required: false,
    nullable: true,
  })
  hospitalRegisterPhoto: string | null;

  @ApiProperty({
    description: 'Timestamp when the outreach action record was created',
    example: new Date().toISOString(),
    type: String,
    format: 'date-time',
  })
  createdAt: Date;
}

export class FindOutreachActionResponseDto extends PaginationControlsDto {
  @ApiProperty({
    description: 'The list of outreach actions',
    type: [OutreachActionsResponseDto],
  })
  results: OutreachActionsResponseDto[];
}
