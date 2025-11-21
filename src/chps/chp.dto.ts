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

// Kenyan phone number regex: matches numbers in form +2547XXXXXXXX or 07XXXXXXXX

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  SEPARATED = 'separated',
}

export class CreateChpDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  lastName: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate({
    message: 'Date of birth must be a valid date',
  })
  // Custom class-validator for not-future date
  // Validator in controller/service: validate before save, or with custom validator
  dateOfBirth: Date;

  @IsNotEmpty()
  @IsString()
  @Matches(PHONE_NUMBER_REGEX, {
    message: 'Phone number must be a valid Kenyan phone number',
  })
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}

export class FindChpDto extends PaginationDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  email: string;
}
