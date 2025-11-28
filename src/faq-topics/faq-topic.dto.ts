import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { PaginationDto } from '../common/commond.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFaqTopicDto {
  @ApiProperty({
    description: 'The name of the FAQ topic',
    example: 'Cervical Cancer Screening',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;
}

export class UpdateFaqTopicDto {
  @ApiProperty({
    description: 'The name of the FAQ topic',
    example: 'Cervical Cancer Screening',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;
}

export class FindFaqTopicDto extends PaginationDto {
  @ApiProperty({
    description: 'Search query to filter FAQ topics by name',
    example: 'cervical',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;
}
