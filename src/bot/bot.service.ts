import { Injectable } from '@nestjs/common';
import { ChatDto } from './bot.dto';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class BotService {
  constructor(private readonly httpService: HttpService) {}

  chat(chatDto: ChatDto) {
    return this.httpService.post<{
      response: string;
      thread_id: string;
    }>('/chat', { query: chatDto.query, thread_id: chatDto.threadId });
  }
}
