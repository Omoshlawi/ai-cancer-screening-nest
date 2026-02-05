import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsDate,
  Matches,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PHONE_NUMBER_REGEX } from '../common/common.contants';
import { PaginationDto } from '../common/commond.dto';
import { ApiProperty } from '@nestjs/swagger';
import { RiskInterpretation } from '../screenings/scoring.dto';

// Kenyan phone number regex: matches numbers in form +2547XXXXXXXX or 07XXXXXXXX

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
  SEPARATED = 'SEPARATED',
}

export class CreateClientDto {
  @ApiProperty({
    description: 'The first name of the client',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  firstName: string;

  @ApiProperty({
    description: 'The last name of the client',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  lastName: string;

  @ApiProperty({
    description: 'The date of birth of the client',
    example: '1990-01-01',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate({
    message: 'Date of birth must be a valid date',
  })
  // Custom class-validator for not-future date
  // Validator in controller/service: validate before save, or with custom validator
  dateOfBirth: Date;

  @ApiProperty({
    description: 'The phone number of the client',
    example: '+254712345678',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(PHONE_NUMBER_REGEX, {
    message: 'Phone number must be a valid Kenyan phone number',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'The county of the client',
    example: 'Kiambu',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  county: string;

  @ApiProperty({
    description: 'The subcounty of the client',
    example: 'Juja',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  subcounty: string;
  @ApiProperty({
    description: 'The ward of the client',
    example: 'Juja',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  ward: string;

  @ApiProperty({
    description: 'The national ID of the client',
    example: '1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  nationalId?: string;

  @ApiProperty({
    description: 'The marital status of the client',
    example: 'single',
  })
  @IsNotEmpty()
  @IsEnum(MaritalStatus)
  maritalStatus: MaritalStatus;
}

export class UpdateClientDto {
  @ApiProperty({
    description: 'The first name of the client',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  firstName: string;

  @ApiProperty({
    description: 'The last name of the client',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  lastName: string;

  @ApiProperty({
    description: 'The date of birth of the client',
    example: '1990-01-01',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({
    message: 'Date of birth must be a valid date',
  })
  dateOfBirth: Date;

  @ApiProperty({
    description: 'The phone number of the client',
    example: '+254712345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(PHONE_NUMBER_REGEX, {
    message: 'Phone number must be a valid Kenyan phone number',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'The email of the client',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  email: string;

  @ApiProperty({
    description: 'The county of the client',
    example: 'Kiambu',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @IsOptional()
  county: string;

  @ApiProperty({
    description: 'The subcounty of the client',
    example: 'Juja',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  subcounty: string;
  @ApiProperty({
    description: 'The ward of the client',
    example: 'Juja',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @IsOptional()
  ward: string;

  @ApiProperty({
    description: 'The marital status of the client',
    example: 'single',
    required: false,
  })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus: MaritalStatus;
}

export class FindClientDto extends PaginationDto {
  @ApiProperty({
    description: 'The search query by name or phone number or national ID',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  search: string;

  @ApiProperty({
    description: 'The name of the client',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The phone number of the client',
    example: '+254712345678',
  })
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'The national ID of the client',
    example: '1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiProperty({
    description: 'Filter by latest screening risk interpretation',
    enum: RiskInterpretation,
    example: RiskInterpretation.HIGH_RISK,
  })
  @IsOptional()
  @IsEnum(RiskInterpretation)
  risk?: RiskInterpretation;

  @ApiProperty({
    description: 'Filter by the ID of the CHP who created the client',
    example: 'clx1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  createdById?: string;
  @ApiProperty({
    description: 'Filter by the ID of the CHP User who created the client',
    example: 'clx1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  createdByUserId?: string;
}
