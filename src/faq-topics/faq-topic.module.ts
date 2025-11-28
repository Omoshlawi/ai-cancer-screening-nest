import { Module } from '@nestjs/common';
import { FaqTopicController } from './faq-topic.controller';
import { FaqTopicService } from './faq-topic.service';

@Module({
  controllers: [FaqTopicController],
  providers: [FaqTopicService],
})
export class FaqTopicModule {}
