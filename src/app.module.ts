import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigifyModule } from '@itgorillaz/configify';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RequireSystemPermissionsGuard } from './auth/auth.guards';

@Module({
  imports: [
    ConfigifyModule.forRootAsync(),
    PrismaModule,
    ScheduleModule.forRoot(),
    AuthModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: RequireSystemPermissionsGuard },
  ],
})
export class AppModule {}
