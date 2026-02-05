import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { FollowUpCategory, Screening } from '../../generated/prisma/client';
import { PaginationControlsDto, PaginationDto } from '../common/commond.dto';
import { RiskInterpretation, ScoringResult } from './scoring.dto';
import { JsonValue } from '@prisma/client/runtime/client';

export enum ScreenBoolean {
  YES = 'YES',
  NO = 'NO',
  NOT_SURE = 'NOT_SURE',
}

export enum SmokingStatus {
  CURRENTLY = 'CURRENTLY',
  NEVER = 'NEVER',
  PAST = 'PAST',
}

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

export class ScreenClientDto {
  @ApiProperty({ description: 'The CUID of the client' })
  @IsString()
  clientId: string;

  @ApiProperty({ description: 'Number of lifetime partners' })
  @Type(() => Number)
  @IsInt()
  lifeTimePatners: number;

  @ApiProperty({ description: 'First intercourse age' })
  @Type(() => Number)
  @IsInt()
  firstIntercourseAge: number;

  @ApiProperty({
    description: 'Whether the client has been diagnosed with HIV',
    enum: ScreenBoolean,
  })
  @IsEnum(ScreenBoolean)
  everDiagnosedWithHIV: ScreenBoolean;

  @ApiProperty({
    description: 'Whether the client has been diagnosed with HPV',
    enum: ScreenBoolean,
  })
  @IsEnum(ScreenBoolean)
  everDiagnosedWithHPV: ScreenBoolean;

  @ApiProperty({
    description: 'Whether the client has been diagnosed with STI',
    enum: ScreenBoolean,
  })
  @IsEnum(ScreenBoolean)
  everDiagnosedWithSTI: ScreenBoolean;

  @ApiProperty({ description: 'Total number of births' })
  @Type(() => Number)
  @IsInt()
  totalBirths: number;

  @ApiProperty({
    description: 'Whether the client has been screened for cervical cancer',
    enum: ScreenBoolean,
  })
  @IsEnum(ScreenBoolean)
  everScreenedForCervicalCancer: ScreenBoolean;

  @ApiProperty({
    description:
      'Whether the client has used oral contraceptives for more than 5 years',
    enum: ScreenBoolean,
  })
  @IsEnum(ScreenBoolean)
  usedOralContraceptivesForMoreThan5Years: ScreenBoolean;

  @ApiProperty({
    description: 'Smoking status',
    enum: SmokingStatus,
  })
  @IsEnum(SmokingStatus)
  smoking: SmokingStatus;

  @ApiProperty({
    description:
      'Whether the client has a family member diagnosed with cervical cancer',
    enum: ScreenBoolean,
  })
  @IsEnum(ScreenBoolean)
  familyMemberDiagnosedWithCervicalCancer: ScreenBoolean;

  @ApiProperty({
    description: 'Geolocation coordinates',
    type: CoordinatesDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;

  // For follow-up
  @ApiProperty({
    description:
      'Id of followup completed by this screening. Only used when followup category is ' +
      FollowUpCategory.RE_SCREENING_RECALL,
    required: false,
  })
  @IsOptional()
  followUpId?: string;
  @ApiProperty({
    description: 'Followup outcome notes. If provided, must be with followUpId',
    required: false,
  })
  @IsOptional()
  outcomeNotes?: string;
}

export enum StringBoolean {
  TRUE = 'true',
  FALSE = 'false',
}

export class FindScreeningsDto extends PaginationDto {
  @ApiProperty({
    description: 'The search term (client or provider name)',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by county',
    required: false,
  })
  @IsOptional()
  @IsString()
  county?: string;

  @ApiProperty({
    description: 'Filter by subcounty',
    required: false,
  })
  @IsOptional()
  @IsString()
  subcounty?: string;

  @ApiProperty({
    description: 'Filter by ward',
    required: false,
  })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiProperty({
    description: 'The cuid of the client',
    required: false,
  })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiProperty({
    description: 'The cuid of the community health provider(admin only)',
    required: false,
  })
  @IsOptional()
  @IsString()
  providerId?: string; // Only for super users

  @ApiProperty({
    description: 'Whether to include screenings for all providers(admin only)',
    required: false,
  })
  @IsOptional()
  @IsEnum(StringBoolean)
  includeForAllProviders?: StringBoolean; // Only for super users

  @ApiProperty({
    description: 'Filter screenings by date from',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  screeningDateFrom?: Date;

  @ApiProperty({
    description: 'Filter screenings by date to',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  screeningDateTo?: Date;

  @ApiProperty({
    description: 'Filter screenings by risk interpretation',
    enum: RiskInterpretation,
    required: false,
    example: RiskInterpretation.HIGH_RISK,
  })
  @IsOptional()
  @IsEnum(RiskInterpretation)
  risk?: RiskInterpretation;
}

export class ScreeningDto implements Screening {
  @ApiProperty({
    description: 'Date client is due for another screening',
  })
  nextScreeningDate: Date | null;
  @ApiProperty({ description: 'Scoring result', type: ScoringResult })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ScoringResult)
  scoringResult: JsonValue;

  @ApiProperty({
    description: 'The CUID of the screening',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'The CUID of the client',
  })
  @IsString()
  clientId: string;

  @ApiProperty({ description: 'CHP Provider CUID' })
  @IsString()
  providerId: string;

  @ApiProperty({ description: 'Number of lifetime partners' })
  @IsInt()
  lifeTimePatners: number;

  @ApiProperty({ description: 'First intercourse age' })
  @IsInt()
  firstIntercourseAge: number;

  @ApiProperty({
    description: 'Whether the client has been diagnosed with HIV',
    enum: ScreenBoolean,
  })
  @IsEnum(ScreenBoolean)
  everDiagnosedWithHIV: ScreenBoolean;

  @ApiProperty({
    description: 'Whether the client has been diagnosed with HPV',
    enum: ScreenBoolean,
  })
  @IsEnum(ScreenBoolean)
  everDiagnosedWithHPV: ScreenBoolean;

  @ApiProperty({
    description: 'Whether the client has been diagnosed with STI',
    enum: ScreenBoolean,
  })
  @IsEnum(ScreenBoolean)
  everDiagnosedWithSTI: ScreenBoolean;

  @ApiProperty({ description: 'Total number of births' })
  @IsInt()
  totalBirths: number;

  @ApiProperty({
    description: 'Whether the client has been screened for cervical cancer',
    enum: ScreenBoolean,
  })
  @IsEnum(ScreenBoolean)
  everScreenedForCervicalCancer: ScreenBoolean;
  @ApiProperty({
    description:
      'Whether the client hasusd oral contraceptive for more than 5 years',
    enum: ScreenBoolean,
  })
  usedOralContraceptivesForMoreThan5Years: ScreenBoolean;

  @ApiProperty({
    description:
      'Whether the client has used oral contraceptives for more than 5 years',
    enum: ScreenBoolean,
  })
  @IsEnum(ScreenBoolean)
  familyMemberDiagnosedWithCervicalCancer: ScreenBoolean;

  @ApiProperty({
    description: 'Coordinates',
    type: CoordinatesDto,
  })
  @Type(() => CoordinatesDto)
  coordinates: JsonValue;

  @ApiProperty({ description: 'Smoking status' })
  @IsEnum(SmokingStatus)
  smoking: SmokingStatus;

  @ApiProperty({ description: 'Created at' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @IsDateString()
  updatedAt: Date;
}

export class FindScreeningsResponseDto extends PaginationControlsDto {
  @ApiProperty({
    description: 'The list of screenings',
    type: [ScreeningDto],
  })
  results: ScreeningDto[];
}
