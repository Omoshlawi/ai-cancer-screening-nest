import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BotConfig } from './bot.config';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';

@Module({
  controllers: [BotController],
  providers: [BotService],
  imports: [
    HttpModule.registerAsync({
      useFactory: (config: BotConfig) => {
        return { baseURL: config.baseUrl };
      },
      inject: [BotConfig],
    }),
  ],
  exports: [BotService],
})
export class BotModule {}
