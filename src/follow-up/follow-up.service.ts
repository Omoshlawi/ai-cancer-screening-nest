/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { FollowUpCategory } from '../../generated/prisma/enums';
import { ActivitiesService } from '../activities/activities.service';
import { UserSession } from '../auth/auth.types';
import { PaginationService } from '../common/pagination.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CancelFollowUpDto,
  CreateFollowUpDto,
  FindFollowUpDto,
  UpdateFollowUpDto,
} from './follow-up.dto';
import { FunctionFirstArgument } from '../common/common.types';
import { pick } from 'lodash';
import { PaginationDto } from '../common/commond.dto';

@Injectable()
export class FollowUpService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async findPending(
    paginationDto: PaginationDto,
    originalUrl: string,
    user: UserSession['user'],
  ) {
    const userRole = Array.isArray(user.role) ? user.role[0] : user.role;
    const isAdmin = userRole?.toLowerCase() === 'admin';

    const chp = !isAdmin
      ? await this.prismaService.communityHealthProvider.findUnique({
          where: { userId: user.id },
        })
      : null;

    if (!isAdmin && !chp) {
      throw new NotFoundException('Community health provider not found');
    }

    const dbQuery: FunctionFirstArgument<
      typeof this.prismaService.followUp.findMany
    > = {
      where: {
        canceledAt: null,
        completedAt: null,
        providerId: isAdmin ? undefined : chp?.id,
      },
      include: {
        triggerScreening: true,
        client: true,
        provider: true,
        referral: true,
        outreachActions: true,
        resolvingScreening: true,
      },
      ...this.paginationService.buildPaginationQuery(paginationDto),
    };

    const [data, totalCount] = await Promise.all([
      this.prismaService.followUp.findMany(dbQuery),
      this.prismaService.followUp.count(pick(dbQuery, 'where')),
    ]);

    return {
      results: data,
      ...this.paginationService.buildPaginationControls(
        totalCount,
        originalUrl,
        paginationDto,
      ),
    };
  }

  async findAll(
    findFollowUpDto: FindFollowUpDto,
    originalUrl: string,
    user: UserSession['user'],
  ) {
    const userRole = Array.isArray(user.role) ? user.role[0] : user.role;
    const isAdmin = userRole?.toLowerCase() === 'admin';

    const chp = !isAdmin
      ? await this.prismaService.communityHealthProvider.findUnique({
          where: { userId: user.id },
        })
      : null;

    if (!chp && !isAdmin) {
      throw new NotFoundException('Community health provider not found');
    }

    const dbQuery: FunctionFirstArgument<
      typeof this.prismaService.followUp.findMany
    > = {
      where: {
        AND: [
          {
            clientId: findFollowUpDto.clientId,
            canceledAt: {
              gte: findFollowUpDto.cancelationDateFrom,
              lte: findFollowUpDto.cancelationDateTo,
            },
            completedAt: {
              gte: findFollowUpDto.completionDateFrom,
              lte: findFollowUpDto.completionDateTo,
            },
            startDate: {
              gte: findFollowUpDto.startDateFrom,
              lte: findFollowUpDto.startDateTo,
            },
            dueDate: {
              gte: findFollowUpDto.dueDateFrom,
              lte: findFollowUpDto.dueDateTo,
            },
            category: findFollowUpDto.category,
            priority: findFollowUpDto.priority,
            triggerScreeningId: findFollowUpDto.triggerScreeningId,
            resolvingScreeningId: findFollowUpDto.resolvingScreeningId,
            referralId: findFollowUpDto.referralId,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            providerId:
              isAdmin && findFollowUpDto.providerId
                ? findFollowUpDto.providerId
                : findFollowUpDto.providerId || chp?.id,
          },
          findFollowUpDto.search
            ? {
                OR: [
                  {
                    client: {
                      OR: [
                        {
                          firstName: {
                            contains: findFollowUpDto.search,
                            mode: 'insensitive',
                          },
                        },
                        {
                          lastName: {
                            contains: findFollowUpDto.search,
                            mode: 'insensitive',
                          },
                        },
                        {
                          nationalId: {
                            contains: findFollowUpDto.search,
                            mode: 'insensitive',
                          },
                        },
                      ],
                    },
                  },
                  {
                    id: {
                      contains: findFollowUpDto.search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    triggerScreeningId: {
                      contains: findFollowUpDto.search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    referralId: {
                      contains: findFollowUpDto.search,
                      mode: 'insensitive',
                    },
                  },
                ],
              }
            : {},
        ],
      },
      orderBy: findFollowUpDto.sortBy
        ? {
            [findFollowUpDto.sortBy]: this.paginationService.getSortOrder(
              findFollowUpDto.sortOrder,
            ),
          }
        : { createdAt: 'desc' },
      include: {
        triggerScreening: true,
        client: true,
        provider: true,
        referral: true,
        outreachActions: true,
        resolvingScreening: true,
      },
      ...this.paginationService.buildPaginationQuery(findFollowUpDto),
    };

    const [data, totalCount] = await Promise.all([
      this.prismaService.followUp.findMany(dbQuery),
      this.prismaService.followUp.count(pick(dbQuery, 'where')),
    ]);

    return {
      results: data,
      ...this.paginationService.buildPaginationControls(
        totalCount,
        originalUrl,
        findFollowUpDto,
      ),
    };
  }

  async create(
    createFollowUpDto: CreateFollowUpDto,
    user: UserSession['user'],
    ipAddress?: string,
    userAgent?: string,
  ) {
    const userRole = Array.isArray(user.role) ? user.role[0] : user.role;
    const isAdmin = userRole?.toLowerCase() === 'admin';

    const screening = await this.prismaService.screening.findUnique({
      where: { id: createFollowUpDto.screeningId },
      include: {
        client: true,
        provider: {
          include: { user: true },
        },
      },
    });

    if (!screening) throw new BadRequestException('screening not found');

    // Ownership check (skip for admins)
    if (!isAdmin && screening.provider.user.id !== user.id) {
      throw new ForbiddenException(
        'User is not a Community Health Provider for this client',
      );
    }

    const startDate = createFollowUpDto.startDate
      ? dayjs(createFollowUpDto.startDate).toDate()
      : undefined;
    const dueDate = dayjs(createFollowUpDto.dueDate).toDate();

    const followUp = await this.prismaService.followUp.create({
      data: {
        triggerScreeningId: createFollowUpDto.screeningId,
        category: createFollowUpDto.category,
        priority: createFollowUpDto.priority,
        startDate,
        dueDate,
        referralId:
          createFollowUpDto.category === FollowUpCategory.REFERRAL_ADHERENCE
            ? createFollowUpDto.referralId
            : undefined,
        providerId: screening.providerId,
        clientId: screening.clientId,
      },
      include: {
        triggerScreening: true,
        client: true,
        provider: true,
        referral: true,
        outreachActions: true,
        resolvingScreening: true,
      },
    });

    // Track activity
    await this.activitiesService.trackActivity(
      user.id,
      {
        action: 'create',
        resource: 'followUp',
        resourceId: followUp.id,
        metadata: {
          clientId: screening.clientId,
          clientName: `${followUp.client.firstName} ${followUp.client.lastName}`,
          category: followUp.category,
          priority: followUp.priority,
          startDate: followUp.startDate.toISOString(),
          dueDate: followUp.dueDate.toISOString(),
        },
      },
      ipAddress,
      userAgent,
    );

    return followUp;
  }

  async update(
    id: string,
    updateFollowUpDto: UpdateFollowUpDto,
    user: UserSession['user'],
    ipAddress?: string,
    userAgent?: string,
  ) {
    const userRole = Array.isArray(user.role) ? user.role[0] : user.role;
    const isAdmin = userRole?.toLowerCase() === 'admin';

    // Get the CHP for the current user
    const chp = !isAdmin
      ? await this.prismaService.communityHealthProvider.findUnique({
          where: { userId: user.id },
        })
      : null;

    if (!isAdmin && !chp) {
      throw new ForbiddenException('User is not a Community Health Provider');
    }

    const existingFollowUp = await this.prismaService.followUp.findUnique({
      where: { id },
    });

    if (!existingFollowUp) {
      throw new NotFoundException('Followup not found');
    }

    // Ownership check (skip for admins)
    if (!isAdmin && existingFollowUp.providerId !== chp?.id) {
      throw new ForbiddenException('You can only update your own followups');
    }

    const startDate = updateFollowUpDto.startDate
      ? dayjs(updateFollowUpDto.startDate).toDate()
      : undefined;
    const dueDate = updateFollowUpDto.dueDate
      ? dayjs(updateFollowUpDto.dueDate).toDate()
      : undefined;

    const followUp = await this.prismaService.followUp.update({
      where: { id },
      data: {
        priority: updateFollowUpDto.priority,
        startDate,
        dueDate,
      },
      include: {
        triggerScreening: true,
        client: true,
        provider: true,
        referral: true,
        outreachActions: true,
        resolvingScreening: true,
      },
    });

    // Track activity
    await this.activitiesService.trackActivity(
      user.id,
      {
        action: 'update',
        resource: 'followUp',
        resourceId: followUp.id,
        metadata: {
          clientId: followUp.clientId,
          clientName: `${followUp.client.firstName} ${followUp.client.lastName}`,
          category: followUp.category,
          priority: followUp.priority,
          startDate: followUp.startDate.toISOString(),
          dueDate: followUp.dueDate.toISOString(),
        },
      },
      ipAddress,
      userAgent,
    );

    return followUp;
  }

  async findOne(id: string, user: UserSession['user']) {
    const userRole = Array.isArray(user.role) ? user.role[0] : user.role;
    const isAdmin = userRole?.toLowerCase() === 'admin';

    // Get the CHP for the current user
    const chp = !isAdmin
      ? await this.prismaService.communityHealthProvider.findUnique({
          where: { userId: user.id },
        })
      : null;

    if (!isAdmin && !chp) {
      throw new ForbiddenException('User is not a Community Health Provider');
    }

    const followUp = await this.prismaService.followUp.findUnique({
      where: { id },
      include: {
        triggerScreening: true,
        client: true,
        provider: true,
        referral: true,
        outreachActions: true,
        resolvingScreening: true,
      },
    });

    if (!followUp) {
      throw new NotFoundException('Followup not found');
    }

    // Verify ownership (skip for admins)
    if (!isAdmin && followUp.providerId !== chp?.id) {
      throw new ForbiddenException(
        'You can only access followups for your own screenings',
      );
    }

    return followUp;
  }

  async delete(
    id: string,
    user: UserSession['user'],
    ipAddress?: string,
    userAgent?: string,
  ) {
    const followUp = await this.findOne(id, user);
    const followUpData = {
      clientId: followUp.clientId,
      clientName: `${followUp.client.firstName} ${followUp.client.lastName}`,
      category: followUp.category,
      priority: followUp.priority,
      startDate: followUp.startDate.toISOString(),
      dueDate: followUp.dueDate.toISOString(),
    };

    await this.prismaService.followUp.delete({
      where: { id: followUp.id },
    });

    // Track activity
    await this.activitiesService.trackActivity(
      user.id,
      {
        action: 'delete',
        resource: 'followUp',
        resourceId: id,
        metadata: followUpData,
      },
      ipAddress,
      userAgent,
    );

    return { id, deleted: true };
  }

  async cancel(
    id: string,
    cancelFollowUpDto: CancelFollowUpDto,
    user: UserSession['user'],
    ipAddress?: string,
    userAgent?: string,
  ) {
    const userRole = Array.isArray(user.role) ? user.role[0] : user.role;
    const isAdmin = userRole?.toLowerCase() === 'admin';

    const existingFollowUp = await this.prismaService.followUp.findUnique({
      where: { id },
    });

    if (!existingFollowUp) {
      throw new NotFoundException('Followup not found');
    }

    // Ownership check (skip for admins)
    if (!isAdmin) {
      const chp = await this.prismaService.communityHealthProvider.findUnique({
        where: { userId: user.id },
      });
      if (!chp || existingFollowUp.providerId !== chp.id) {
        throw new ForbiddenException('You can only cancel your own followups');
      }
    }

    const followUp = await this.prismaService.followUp.update({
      where: { id, completedAt: null, canceledAt: null },
      data: {
        canceledAt: dayjs().toDate(),
        cancelNotes: cancelFollowUpDto.cancelNotes,
        cancelReason: cancelFollowUpDto.cancelReason,
      },
      include: {
        triggerScreening: true,
        client: true,
        provider: true,
        referral: true,
        outreachActions: true,
        resolvingScreening: true,
      },
    });

    const followUpData = {
      clientId: followUp.clientId,
      clientName: `${followUp.client.firstName} ${followUp.client.lastName}`,
      category: followUp.category,
      priority: followUp.priority,
      startDate: followUp.startDate.toISOString(),
      dueDate: followUp.dueDate.toISOString(),
    };

    await this.activitiesService.trackActivity(
      user.id,
      {
        action: 'cancel',
        resource: 'followUp',
        resourceId: id,
        metadata: followUpData,
      },
      ipAddress,
      userAgent,
    );

    return followUp;
  }
}
