import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class ChatDto {
  @ApiProperty({
    type: 'string',
    description: 'Query message for chatbot',
    example:
      'Ni vifo vingapi vilisababishwa na saratani ya mlango wa uzazi mnamo mwaka 2020?',
  })
  @IsString()
  @MinLength(3)
  query: string;
  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Optional thread id',
    example: 'optional-session-id',
  })
  @IsString()
  @IsOptional()
  threadId: string;
}

export class ChatQueryDto extends OmitType(ChatDto, ['threadId'] as const) {}
