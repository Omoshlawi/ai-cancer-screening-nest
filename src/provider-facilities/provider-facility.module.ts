import { Module } from '@nestjs/common';
import { ProviderFacilityController } from './provider-facility.controller';
import { ProviderFacilityService } from './provider-facility.service';

@Module({
  controllers: [ProviderFacilityController],
  providers: [ProviderFacilityService],
  exports: [ProviderFacilityService],
})
export class ProviderFacilitiesModule {}
