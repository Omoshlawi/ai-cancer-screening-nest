import { FunctionFirstArgument } from 'src/common/common.types';
import { ActivitiesService } from '../activities/activities.service';
import { UserSession } from '../auth/auth.types';
import { PaginationService } from '../common/pagination.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOutreachActionDto } from './follow-up.outreach.dto';
import { PaginationDto } from 'src/common/commond.dto';
import { pick } from 'lodash';
import { Inject } from '@nestjs/common';

export class FollowUpOutreachActionService {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create(
    followUpId: string,
    createOutreachDto: CreateOutreachActionDto,
    user: UserSession['user'],
    ipAddress?: string,
    userAgent?: string,
  ) {
    const followUp = await this.prismaService.followUp.update({
      where: { id: followUpId, provider: { userId: user.id } },
      data: {
        outreachActions: {
          create: {
            actionDate: createOutreachDto.actionDate,
            actionType: createOutreachDto.actionType,
            outcome: createOutreachDto.outcome,
            barriers:
              createOutreachDto.outcome === 'BARRIER_IDENTIFIED'
                ? createOutreachDto.barriers
                : undefined,
            contactMethod: createOutreachDto.contactMethod,
            duration: createOutreachDto.duration,
            location:
              createOutreachDto.actionType === 'HOME_VISIT'
                ? createOutreachDto.location
                : undefined,
            nextPlannedDate: createOutreachDto.nextPlannedDate,
            notes: createOutreachDto.notes,
          },
        },
      },
      include: {
        outreachActions: {
          orderBy: { createdAt: 'desc' },
        },
        client: true,
      },
    });
    const outreach = followUp.outreachActions[0];
    // Track activity
    await this.activitiesService.trackActivity(
      user.id,
      {
        action: 'create',
        resource: 'outreachActions',
        resourceId: outreach.id,
        metadata: {
          clientId: followUp.clientId,
          clientName: `${followUp.client.firstName} ${followUp.client.lastName}`,
          actionDate: outreach.actionDate.toISOString(),
          actionType: outreach.actionType,
          contactMethod: outreach.contactMethod,
          outcome: outreach.contactMethod,
        },
      },
      ipAddress,
      userAgent,
    );

    return outreach;
  }

  async findAll(
    followUpId: string,
    user: UserSession['user'],
    query: PaginationDto,
    originalUrl: string,
  ) {
    const dbQuery: FunctionFirstArgument<
      typeof this.prismaService.outreachAction.findMany
    > = {
      where: { followUp: { id: followUpId, provider: { userId: user.id } } },
      ...this.paginationService.buildPaginationQuery(query),
    };
    const [data, totalCount] = await Promise.all([
      this.prismaService.outreachAction.findMany(dbQuery),
      this.prismaService.outreachAction.count(pick(dbQuery, 'where')),
    ]);
    return {
      results: data,
      ...this.paginationService.buildPaginationControls(
        totalCount,
        originalUrl,
        query,
      ),
    };
  }
}
