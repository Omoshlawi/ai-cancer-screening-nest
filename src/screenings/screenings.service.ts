/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import dayjs from 'dayjs';
import { pick } from 'lodash';
import { FollowUpCategory } from '../../generated/prisma/browser';
import { ActivitiesService } from '../activities/activities.service';
import { UserSession } from '../auth/auth.types';
import { FunctionFirstArgument } from '../common/common.types';
import { PaginationService } from '../common/pagination.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from './scoring.sevice';
import {
  FindScreeningsDto,
  ScreenClientDto,
  StringBoolean,
} from './screenings.dto';

@Injectable()
export class ScreeningsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly scoringService: ScoringService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async findAll(
    findScreeningsDto: FindScreeningsDto,
    originalUrl: string,
    user: UserSession['user'],
  ) {
    const chp = await this.prismaService.communityHealthProvider.findUnique({
      where: { userId: user.id },
    });
    if (!chp) {
      throw new NotFoundException('Community health provider not found');
    }
    const dbQuery: FunctionFirstArgument<
      typeof this.prismaService.screening.findMany
    > = {
      where: {
        clientId: findScreeningsDto.clientId,
        providerId:
          findScreeningsDto.includeForAllProviders === StringBoolean.TRUE
            ? undefined
            : (findScreeningsDto.providerId ?? chp.id),
        createdAt: {
          gte: findScreeningsDto.screeningDateFrom ?? undefined,
          lte: findScreeningsDto.screeningDateTo ?? undefined,
        },
        scoringResult: findScreeningsDto.risk
          ? {
              path: ['interpretation'],
              equals: findScreeningsDto.risk,
            }
          : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        client: true,
        provider: true,
      },
      ...this.paginationService.buildPaginationQuery(findScreeningsDto),
    };
    const [data, totalCount] = await Promise.all([
      this.prismaService.screening.findMany(dbQuery),
      this.prismaService.screening.count(pick(dbQuery, 'where')),
    ]);
    return {
      results: data,
      ...this.paginationService.buildPaginationControls(
        totalCount,
        originalUrl,
        findScreeningsDto,
      ),
    };
  }

  private async getFollowUp(providerId: string, followUpId?: string) {
    if (followUpId) {
      const followUp = await this.prismaService.followUp.findUnique({
        where: {
          id: followUpId,
          providerId,
          canceledAt: null,
          completedAt: null,
        },
      });
      if (!followUp) return null;
      // Followup category must be rescreening else return null
      if (followUp.category !== FollowUpCategory.RE_SCREENING_RECALL)
        return null;
      return followUp;
    }
    return null;
  }

  async create(
    screenClientDto: ScreenClientDto,
    user: UserSession['user'],
    ipAddress?: string,
    userAgent?: string,
  ) {
    const chp = await this.prismaService.communityHealthProvider.findUnique({
      where: { userId: user.id },
    });
    if (!chp) {
      throw new NotFoundException('Community health provider not found');
    }

    const scoringResult = await this.scoringService.scoreClient(
      screenClientDto.clientId,
      screenClientDto,
    );
    const screening = await this.prismaService.screening.create({
      data: {
        ...screenClientDto,
        providerId: chp.id,
        coordinates: {
          latitude: screenClientDto.coordinates.latitude,
          longitude: screenClientDto.coordinates.longitude,
        },
        scoringResult: scoringResult as any,
      },
      include: {
        client: true,
        provider: true,
      },
    });

    // Update client metadata with latest screening interpretation and score
    await this.prismaService.client.update({
      where: { id: screenClientDto.clientId },
      data: {
        metadata: {
          riskInterpretation: scoringResult.interpretation,
          riskScore: scoringResult.aggregateScore,
        },
      },
    });

    // Track screening creation activity
    await this.activitiesService.trackActivity(
      user.id,
      {
        action: 'create',
        resource: 'screening',
        resourceId: screening.id,
        metadata: {
          clientId: screening.clientId,
          clientName: `${screening.client.firstName} ${screening.client.lastName}`,
          screeningId: screening.id,
          riskScore: scoringResult.aggregateScore,
          riskInterpretation: scoringResult.interpretation,
        },
      },
      ipAddress,
      userAgent,
    );

    // Get and complete follow-up
    const followUp = await this.getFollowUp(chp.id, screenClientDto.followUpId);
    if (followUp) {
      // Complete followup
      await this.prismaService.followUp.update({
        where: { id: followUp.id },
        data: {
          completedAt: dayjs().toDate(),
          resolvingScreeningId: screening.id,
          outcomeNotes: screenClientDto.outcomeNotes,
        },
      });
      // Track followup completion activity
      await this.activitiesService.trackActivity(
        user.id,
        {
          action: 'complete',
          resource: 'followUp',
          resourceId: followUp.id,
          metadata: {
            clientId: followUp.clientId,
            clientName: `${screening.client.firstName} ${screening.client.lastName}`,
            category: followUp.category,
            priority: followUp.priority,
            startDate: followUp.startDate.toISOString(),
            dueDate: followUp.dueDate.toISOString(),
          },
        },
        ipAddress,
        userAgent,
      );
    }

    return screening;
  }

  async findOne(id: string) {
    const screening = await this.prismaService.screening.findUnique({
      where: { id },
      include: {
        client: true,
        provider: true,
      },
    });
    if (!screening) {
      throw new NotFoundException('Screening not found');
    }

    return screening;
  }
}
