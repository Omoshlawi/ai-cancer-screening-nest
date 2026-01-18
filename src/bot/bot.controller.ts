import { Body, Controller, Post } from '@nestjs/common';
import { BotService } from './bot.service';
import { ChatDto } from './bot.dto';
import { ApiOperation } from '@nestjs/swagger';
import { ApiErrorsResponse } from '../common/common.decorators';
import { map } from 'rxjs';

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat' })
  @ApiErrorsResponse({ badRequest: true })
  chart(@Body() chatDto: ChatDto) {
    return this.botService.chat(chatDto).pipe(
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
