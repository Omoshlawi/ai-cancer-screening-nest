import { ConfigifyModule } from '@itgorillaz/configify';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaPg } from '@prisma/adapter-pg';
import { ActivitiesModule } from './activities/activities.module';
import { AddressHierarchyModule } from './address-hierarchy/address-hierarchy.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RequireSystemPermissionsGuard } from './auth/auth.guards';
import { AuthModule } from './auth/auth.module';
import { BotModule } from './bot/bot.module';
import { RequireCHPGuard } from './chps/chp.guards';
import { ChpsModule } from './chps/chps.module';
import { ClientsModule } from './clients/clients.module';
import { CommonModule } from './common/common.module';
import { FaqTopicModule } from './faq-topics/faq-topic.module';
import { FaqModule } from './faq/faq.module';
import { HealthFacilityModule } from './health-facilities/health-facility.module';
import { HealthFacilityTypeModule } from './health-facility-types/health-facility-type.module';
import { PrismaConfig } from './prisma/prisma.config';
import { PrismaModule } from './prisma/prisma.module';
import { ReferralModule } from './referrals/referral.module';
import { ScreeningsModule } from './screenings/screenings.module';

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
    BotModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: RequireSystemPermissionsGuard },
    { provide: APP_GUARD, useClass: RequireCHPGuard },
  ],
})
export class AppModule {}
