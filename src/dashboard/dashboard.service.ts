import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import dayjs from 'dayjs';
import { FindScreeningsDto } from '../screenings/screenings.dto';

@Injectable()
export class DashboardService {
    constructor(private readonly prismaService: PrismaService) { }

    async getAdminSummary(currentUserId: string, filters?: FindScreeningsDto) {
        const now = dayjs();
        const startOfMonth = now.startOf('month').toDate();
        const sixMonthsAgo = now.subtract(6, 'month').startOf('month').toDate();

        // Build base where clause for screenings
        const screeningWhere: any = {};
        if (filters?.screeningDateFrom) screeningWhere.createdAt = { ...screeningWhere.createdAt, gte: new Date(filters.screeningDateFrom) };
        if (filters?.screeningDateTo) screeningWhere.createdAt = { ...screeningWhere.createdAt, lte: new Date(filters.screeningDateTo) };
        if (filters?.providerId && filters.providerId !== 'all') screeningWhere.providerId = filters.providerId;
        if ((filters as any)?.risk && (filters as any).risk !== 'all') {
            screeningWhere.scoringResult = {
                path: ['interpretation'],
                equals: (filters as any).risk,
            };
        }

        // Build where clause for follow-ups (referrals)
        const followUpWhere: any = { category: 'REFERRAL_ADHERENCE' };
        if (filters?.providerId && filters.providerId !== 'all') followUpWhere.providerId = filters.providerId;
        if (filters?.screeningDateFrom) followUpWhere.createdAt = { ...followUpWhere.createdAt, gte: new Date(filters.screeningDateFrom) };
        if (filters?.screeningDateTo) followUpWhere.createdAt = { ...followUpWhere.createdAt, lte: new Date(filters.screeningDateTo) };

        const [
            totalScreenings,
            totalChps,
            totalClients,
            totalFollowUps,
            completedFollowUps,
            riskScreenings,
            chpsWithStats,
            screeningsThisMonth,
            referralFollowUps,
            completedReferralFollowUps,
            recentScreenings,
            recentReferrals,
        ] = await Promise.all([
            this.prismaService.screening.count({ where: screeningWhere }),
            this.prismaService.communityHealthProvider.count(),
            this.prismaService.client.count(),
            this.prismaService.followUp.count({ where: { ...followUpWhere, category: undefined } }), // Global follow-up count with filters
            this.prismaService.followUp.count({ where: { ...followUpWhere, category: undefined, completedAt: { not: null } } }),

            // For risk distribution
            this.prismaService.screening.findMany({
                where: screeningWhere,
                select: { scoringResult: true },
            }),
            // CHP Performance (Top 5)
            this.prismaService.communityHealthProvider.findMany({
                include: {
                    _count: {
                        select: {
                            screenings: true,
                            clients: true,
                        },
                    },
                },
                take: 5,
            }),
            // Analytics for Screening Page (Always current month unless filtered?)
            // Actually, if date filters are present, we should probably still show the filtered count as "Total"
            this.prismaService.screening.count({
                where: { ...screeningWhere, createdAt: { gte: startOfMonth } },
            }),
            this.prismaService.followUp.count({ where: followUpWhere }),
            this.prismaService.followUp.count({
                where: { ...followUpWhere, completedAt: { not: null } },
            }),
            // For trends (last 6 months - ignore date filters for the chart range but apply CHP/Risk)
            this.prismaService.screening.findMany({
                where: {
                    createdAt: { gte: sixMonthsAgo },
                    providerId: screeningWhere.providerId,
                    scoringResult: screeningWhere.scoringResult,
                },
                select: { createdAt: true },
            }),
            this.prismaService.followUp.findMany({
                where: {
                    createdAt: { gte: sixMonthsAgo },
                    providerId: followUpWhere.providerId,
                },
                select: { createdAt: true, completedAt: true },
            }),
        ]);

        // Calculate Risk Distribution
        const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
        riskScreenings.forEach((s) => {
            const result = s.scoringResult as any;
            const interpretation = (result?.interpretation || '').toUpperCase();

            if (interpretation.includes('LOW')) riskCounts.LOW++;
            else if (interpretation.includes('MEDIUM') || interpretation.includes('MODERATE')) riskCounts.MEDIUM++;
            else if (interpretation.includes('HIGH')) riskCounts.HIGH++;
        });

        const totalRisk = riskCounts.LOW + riskCounts.MEDIUM + riskCounts.HIGH || totalScreenings || 1;
        const riskDistribution = [
            { name: 'Low Risk', value: Math.round((riskCounts.LOW / totalRisk) * 100), color: 'oklch(0.5 0.1 190)' },
            { name: 'Medium Risk', value: Math.round((riskCounts.MEDIUM / totalRisk) * 100), color: 'oklch(0.7 0.15 80)' },
            { name: 'High Risk', value: Math.round((riskCounts.HIGH / totalRisk) * 100), color: 'oklch(0.6 0.2 25)' },
        ];

        // Format Trends Data
        const trends: { month: string; value: number; target: number; rate: number }[] = [];
        const targets = [50, 55, 55, 60, 60, 70, 75, 80, 85]; // Seasonal targets
        for (let i = 5; i >= 0; i--) {
            const month = now.subtract(i, 'month');
            const monthLabel = month.format('MMM');
            const screeningsCount = recentScreenings.filter(s => dayjs(s.createdAt).isSame(month, 'month')).length;

            const monthFollowUps = recentReferrals.filter(f => dayjs(f.createdAt).isSame(month, 'month'));
            const monthCompleted = monthFollowUps.filter(f => f.completedAt && dayjs(f.completedAt).isSame(month, 'month')).length;
            const rate = monthFollowUps.length > 0 ? Math.round((monthCompleted / monthFollowUps.length) * 100) : 85; // Default/Mock if no data

            trends.push({
                month: monthLabel,
                value: screeningsCount,
                target: targets[targets.length - 1 - i] || 60,
                rate: rate
            });
        }

        const referralCompletionRate = referralFollowUps > 0
            ? Math.round((completedReferralFollowUps / referralFollowUps) * 100)
            : 0;

        const followUpRate = totalFollowUps > 0
            ? Math.round((completedFollowUps / totalFollowUps) * 100)
            : 0;

        const systemTotalWork = (await this.prismaService.screening.count()) + (await this.prismaService.client.count()) || 1;

        return {
            stats: {
                totalScreenings,
                activeChps: totalChps,
                totalClients,
                screeningsThisMonth,
                referralCompletionRate: `${referralCompletionRate}%`,
                followUpRate: `${followUpRate}%`,
            },
            riskDistribution,
            chpPerformance: chpsWithStats.map((c) => ({
                name: c.firstName ? `${c.firstName} ${c.lastName}` : (c as any).user?.name || 'Unknown Provider',
                performance: `${Math.round(((c._count.clients + c._count.screenings) / systemTotalWork) * 100)}%`,
                clients: c._count.clients,
                screenings: c._count.screenings,
            })),
            analytics: {
                trends,
            },
        };
    }

    async getChpPerformanceReport(filters?: FindScreeningsDto) {
        const screeningWhere: any = {};
        if (filters?.screeningDateFrom) screeningWhere.createdAt = { ...screeningWhere.createdAt, gte: new Date(filters.screeningDateFrom) };
        if (filters?.screeningDateTo) screeningWhere.createdAt = { ...screeningWhere.createdAt, lte: new Date(filters.screeningDateTo) };

        const followUpWhere: any = {};
        if (filters?.screeningDateFrom) followUpWhere.createdAt = { ...followUpWhere.createdAt, gte: new Date(filters.screeningDateFrom) };
        if (filters?.screeningDateTo) followUpWhere.createdAt = { ...followUpWhere.createdAt, lte: new Date(filters.screeningDateTo) };

        const clientWhere: any = {};
        if (filters?.screeningDateFrom) clientWhere.createdAt = { ...clientWhere.createdAt, gte: new Date(filters.screeningDateFrom) };
        if (filters?.screeningDateTo) clientWhere.createdAt = { ...clientWhere.createdAt, lte: new Date(filters.screeningDateTo) };

        const chps = await this.prismaService.communityHealthProvider.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                screenings: {
                    where: screeningWhere,
                    select: { id: true },
                },
                clients: {
                    where: clientWhere,
                    select: { id: true },
                },
                followUps: {
                    where: followUpWhere,
                    select: { id: true, completedAt: true },
                },
            },
        });

        const systemTotalWork = (await this.prismaService.screening.count({ where: screeningWhere })) +
            (await this.prismaService.client.count({ where: clientWhere })) || 1;

        return chps.map((c) => {
            const totalScreening = c.screenings.length;
            const totalClients = c.clients.length;
            const totalFollowUps = c.followUps.length;
            const completedFollowUps = c.followUps.filter(f => f.completedAt).length;

            const followUpRate = totalFollowUps > 0
                ? Math.round((completedFollowUps / totalFollowUps) * 100)
                : 0;

            const performance = Math.round(((totalClients + totalScreening) / systemTotalWork) * 100);

            return {
                name: c.firstName ? `${c.firstName} ${c.lastName}` : c.user?.name || 'Unknown Provider',
                email: c.user?.email || 'N/A',
                totalClients,
                totalScreening,
                followUpRate: `${followUpRate}%`,
                overallPerformance: `${performance}%`,
            };
        });
    }
}
