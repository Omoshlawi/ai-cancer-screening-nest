import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum RiskFactor {
  AGE = 'AGE',
  EARLY_SEXUAL_DEBUT = 'EARLY_SEXUAL_DEBUT',
  MULTIPLE_PARTNERS = 'MULTIPLE_PARTNERS',
  SEXUALLY_TRANSMITTED_INFECTION = 'SEXUALLY_TRANSMITTED_INFECTION',
  PARITY = 'PARITY',
  NEVER_SCREENED = 'NEVER_SCREENED',
  ORAL_CONTRACEPTIVES = 'ORAL_CONTRACEPTIVES',
  SMOKING = 'SMOKING',
  FAMILY_HISTORY = 'FAMILY_HISTORY',
}

export enum RiskInterpretation {
  NO_RISK = 'NO_RISK',
  VERY_LOW_RISK = 'VERY_LOW_RISK',
  LOW_RISK = 'LOW_RISK',
  MODERATE_RISK = 'MODERATE_RISK',
  HIGH_RISK = 'HIGH_RISK',
  VERY_HIGH_RISK = 'VERY_HIGH_RISK',
}

export class RiskFactorScore {
  @ApiProperty({ description: 'Factor' })
  @IsEnum(RiskFactor)
  factor: RiskFactor;

  @ApiProperty({ description: 'Score' })
  @IsNumber()
  @Type(() => Number)
  score: number;

  @ApiProperty({ description: 'Reason' })
  @IsString()
  @Type(() => String)
  reason: string;
}

export class ScoringResult {
  @ApiProperty({ description: 'Client age' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  clientAge: number | null;

  @ApiProperty({
    description: 'Breakdown of the scoring result',
    type: RiskFactorScore,
    isArray: true,
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @ValidateNested({ each: true })
  @Type(() => RiskFactorScore)
  breakdown: RiskFactorScore[];

  @ApiProperty({ description: 'Aggregate score' })
  @IsNumber()
  aggregateScore: number;
  @ApiProperty({ description: 'Interpretation' })
  @IsEnum(RiskInterpretation)
  interpretation: RiskInterpretation;

  @ApiProperty({ description: 'Should auto screen' })
  @IsBoolean()
  @Type(() => Boolean)
  shouldAutoScreen: boolean;
}
