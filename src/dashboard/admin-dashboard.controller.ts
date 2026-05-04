import { Controller, Get, Query, Session } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { UserSession } from '../auth/auth.types';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireSystemPermission } from '../auth/auth.decorators';
import { ApiErrorsResponse } from '../common/common.decorators';
import { FindScreeningsDto } from '../screenings/screenings.dto';

@ApiTags('Admin')
@Controller('admin/dashboard')
export class AdminDashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('summary')
    @RequireSystemPermission({
        chp: ['list'],
    })
    @ApiOperation({ summary: 'Get administrative dashboard summary' })
    @ApiErrorsResponse()
    async getSummary(
        @Query() filters: FindScreeningsDto,
        @Session() session: UserSession,
    ) {
        return this.dashboardService.getAdminSummary(session.user.id, filters);
    }

    @Get('chp-performance')
    @RequireSystemPermission({
        chp: ['list'],
    })
    @ApiOperation({ summary: 'Get detailed CHP performance report' })
    @ApiErrorsResponse()
    async getChpPerformance(
        @Query() filters: FindScreeningsDto,
    ) {
        return this.dashboardService.getChpPerformanceReport(filters);
    }
}
