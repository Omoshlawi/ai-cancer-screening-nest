import { Module } from '@nestjs/common';
import { HealthFacilityController } from './health-facility.controller';
import { HealthFacilityService } from './health-facility.service';

@Module({
  controllers: [HealthFacilityController],
  providers: [HealthFacilityService],
})
export class HealthFacilityModule {}
