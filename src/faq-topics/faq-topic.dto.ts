import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { PaginationDto, PaginationControlsDto } from '../common/commond.dto';
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

export class FaqItemResponseDto {
  @ApiProperty({ description: 'The ID of the FAQ', example: 'clx1234567890' })
  id: string;

  @ApiProperty({
    description: 'The question',
    example: 'What is cervical cancer screening?',
  })
  question: string;

  @ApiProperty({
    description: 'The answer',
    example:
      'Cervical cancer screening is a test to detect abnormal cells in the cervix before they become cancerous.',
  })
  answer: string;

  @ApiProperty({
    description: 'The topic ID (optional)',
    example: 'clx1234567890',
    required: false,
  })
  topicId: string | null;

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

export class FaqTopicResponseDto {
  @ApiProperty({
    description: 'The ID of the FAQ topic',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the FAQ topic',
    example: 'Cervical Cancer Screening',
  })
  name: string;

  @ApiProperty({
    description: 'The list of FAQs in this topic',
    type: [FaqItemResponseDto],
  })
  faqs: FaqItemResponseDto[];

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

export class FindFaqTopicResponseDto extends PaginationControlsDto {
  @ApiProperty({
    description: 'The list of FAQ topics',
    type: [FaqTopicResponseDto],
  })
  results: FaqTopicResponseDto[];
}
