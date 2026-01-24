import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { map } from 'rxjs';
import { ApiErrorsResponse } from '../common/common.decorators';
import { ChatQueryDto } from './bot.dto';
import { BotService } from './bot.service';

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat' })
  @ApiErrorsResponse({ badRequest: true })
  chart(@Body() chatDto: ChatQueryDto, @Session() userSession: UserSession) {
    return this.botService
      .chat({ query: chatDto.query, threadId: userSession.session.id })
      .pipe(
        map((res) => {
          const data = res.data;
          return {
            response: data.response,
            threadId: data.thread_id,
          };
        }),
      );
  }
}
