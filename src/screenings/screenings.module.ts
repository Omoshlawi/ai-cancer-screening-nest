import { Module } from '@nestjs/common';
import { ScreeningsController } from './screenings.controller';
import { ScreeningsService } from './screenings.service';
import { ScoringService } from './scoring.sevice';

@Module({
  controllers: [ScreeningsController],
  providers: [ScreeningsService, ScoringService],
})
export class ScreeningsModule {}
