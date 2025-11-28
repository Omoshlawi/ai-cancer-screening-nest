import { Module } from '@nestjs/common';
import { HealthFacilityTypeController } from './health-facility-type.controller';
import { HealthFacilityTypeService } from './health-facility-type.service';

@Module({
  controllers: [HealthFacilityTypeController],
  providers: [HealthFacilityTypeService],
})
export class HealthFacilityTypeModule {}
