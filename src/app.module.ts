import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigifyModule } from '@itgorillaz/configify';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RequireSystemPermissionsGuard } from './auth/auth.guards';
import { ClientsModule } from './clients/clients.module';
import { ChpsModule } from './chps/chps.module';
import { CommonModule } from './common/common.module';
import { RequireCHPGuard } from './chps/chp.guards';
import { ScreeningsModule } from './screenings/screenings.module';
import { FaqModule } from './faq/faq.module';
import { FaqTopicModule } from './faq-topics/faq-topic.module';
import { HealthFacilityModule } from './health-facilities/health-facility.module';
import { HealthFacilityTypeModule } from './health-facility-types/health-facility-type.module';
import { ReferralModule } from './referrals/referral.module';
import { ActivitiesModule } from './activities/activities.module';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaConfig } from './prisma/prisma.config';
import { AddressHierarchyModule } from './address-hierarchy/address-hierarchy.module';

@Module({
  imports: [
    ConfigifyModule.forRootAsync(),
    PrismaModule.forRootAsync({
      global: true,
      useFactory: (config: PrismaConfig) => {
        return {
          adapter: new PrismaPg({ connectionString: config.databaseUrl }),
        };
      },
      inject: [PrismaConfig],
    }),
    ScheduleModule.forRoot(),
    CommonModule.register({ global: true }),
    AuthModule.forRoot(),
    ClientsModule,
    ChpsModule,
    ScreeningsModule,
    FaqModule,
    FaqTopicModule,
    HealthFacilityModule,
    HealthFacilityTypeModule,
    ReferralModule,
    ActivitiesModule,
    AddressHierarchyModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: RequireSystemPermissionsGuard },
    { provide: APP_GUARD, useClass: RequireCHPGuard },
  ],
})
export class AppModule {}
