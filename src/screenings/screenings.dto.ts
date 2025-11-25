import {
  IsString,
  IsEnum,
  IsInt,
  IsNumber,
  IsLatitude,
  IsLongitude,
  IsDateString,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Screening } from '../../generated/prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { PaginationControlsDto } from '../common/commond.dto';
import { ApiProperty } from '@nestjs/swagger';

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
  @IsNumber()
  @IsLatitude()
  latitude: number;
  @ApiProperty({ description: 'Longitude', example: 36.8219 })
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
  smoke: SmokingStatus;

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
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;
}

export enum StringBoolean {
  TRUE = 'true',
  FALSE = 'false',
}

export class FindScreeningsDto {
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
}

export class ScreeningDto implements Screening {
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
