import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { PaginationDto } from '../common/commond.dto';
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
