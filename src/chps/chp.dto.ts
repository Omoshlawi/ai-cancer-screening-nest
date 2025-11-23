import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsDate,
  Matches,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PHONE_NUMBER_REGEX } from '../common/common.contants';
import { PaginationDto } from '../common/commond.dto';
import { ApiProperty } from '@nestjs/swagger';

// Kenyan phone number regex: matches numbers in form +2547XXXXXXXX or 07XXXXXXXX

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  SEPARATED = 'separated',
}

export class CreateChpDto {
  @ApiProperty({
    description: 'The username of the community health provider',
    example: 'john_doe',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    description: 'The first name of the community health provider',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  firstName: string;

  @ApiProperty({
    description: 'The last name of the community health provider',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  lastName: string;

  @ApiProperty({
    description: 'The date of birth of the community health provider',
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
    description: 'The phone number of the community health provider',
    example: '+254712345678',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(PHONE_NUMBER_REGEX, {
    message: 'Phone number must be a valid Kenyan phone number',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'The email of the community health provider',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  email: string;

  @ApiProperty({
    description: 'The password of the community health provider',
    example: 'password',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}

export class FindChpDto extends PaginationDto {
  @ApiProperty({
    description: 'The name of the community health provider',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The phone number of the community health provider',
    example: '+254712345678',
  })
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'The email of the community health provider',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsString()
  email: string;
}
