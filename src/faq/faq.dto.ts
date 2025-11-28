import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { PaginationDto, PaginationControlsDto } from '../common/commond.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFaqDto {
  @ApiProperty({
    description: 'The question for the FAQ',
    example: 'What is cervical cancer screening?',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  question: string;

  @ApiProperty({
    description: 'The answer to the FAQ question',
    example:
      'Cervical cancer screening is a test to detect abnormal cells in the cervix before they become cancerous.',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  answer: string;

  @ApiProperty({
    description: 'The ID of the FAQ topic (optional)',
    example: 'clx1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  topicId?: string;
}

export class UpdateFaqDto {
  @ApiProperty({
    description: 'The question for the FAQ',
    example: 'What is cervical cancer screening?',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  question?: string;

  @ApiProperty({
    description: 'The answer to the FAQ question',
    example:
      'Cervical cancer screening is a test to detect abnormal cells in the cervix before they become cancerous.',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  answer?: string;

  @ApiProperty({
    description: 'The ID of the FAQ topic (optional)',
    example: 'clx1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  topicId?: string;
}

export class FindFaqDto extends PaginationDto {
  @ApiProperty({
    description: 'Search query to filter FAQs by question or answer',
    example: 'cervical cancer',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;

  @ApiProperty({
    description: 'Filter FAQs by topic ID',
    example: 'clx1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  topicId?: string;
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

export class FaqResponseDto {
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
    description: 'The FAQ topic (if associated)',
    type: FaqTopicResponseDto,
    required: false,
  })
  topic: FaqTopicResponseDto | null;

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

export class FindFaqResponseDto extends PaginationControlsDto {
  @ApiProperty({
    description: 'The list of FAQs',
    type: [FaqResponseDto],
  })
  results: FaqResponseDto[];
}
