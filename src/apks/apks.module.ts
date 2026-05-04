import { Module } from '@nestjs/common';
import { ApksService } from './apks.service';
import { ApksController } from './apks.controller';

@Module({
  controllers: [ApksController],
  providers: [ApksService],
  exports: [ApksService],
})
export class ApksModule {}
