import { Module } from '@nestjs/common';
import { ChpsController } from './chps.controller';
import { ChpsService } from './chps.service';

@Module({
  controllers: [ChpsController],
  providers: [ChpsService]
})
export class ChpsModule {}
