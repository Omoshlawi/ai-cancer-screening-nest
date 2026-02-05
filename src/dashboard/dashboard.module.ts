import { Module } from '@nestjs/common';
import { AdminDashboardController } from './admin-dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AdminDashboardController],
    providers: [DashboardService],
    exports: [DashboardService],
})
export class DashboardModule { }
