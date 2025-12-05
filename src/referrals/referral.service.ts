/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { pick } from 'lodash';
import { UserSession } from '../auth/auth.types';
import { FunctionFirstArgument } from '../common/common.types';
import { PaginationService } from '../common/pagination.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateReferralDto,
  FindReferralDto,
  ReferralStatus,
  UpdateReferralDto,
} from './referral.dto';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class ReferralService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create(
    createReferralDto: CreateReferralDto,
    user: UserSession['user'],
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Get the CHP for the current user
    const chp = await this.prismaService.communityHealthProvider.findUnique({
      where: { userId: user.id },
    });

    if (!chp) {
      throw new ForbiddenException('User is not a Community Health Provider');
    }

    // Verify the screening belongs to this CHP
    const screening = await this.prismaService.screening.findUnique({
      where: { id: createReferralDto.screeningId },
      include: {
        client: true,
      },
    });

    if (!screening) {
      throw new NotFoundException('Screening not found');
    }

    if (screening.providerId !== chp.id) {
      throw new ForbiddenException(
        'You can only create referrals for your own screenings',
      );
    }

    // Verify health facility exists
    const healthFacility = await this.prismaService.healthFacility.findUnique({
      where: { id: createReferralDto.healthFacilityId },
    });

    if (!healthFacility) {
      throw new NotFoundException('Health facility not found');
    }

    const referral = await this.prismaService.referral.create({
      data: {
        screeningId: createReferralDto.screeningId,
        appointmentTime: new Date(createReferralDto.appointmentTime),
        additionalNotes: createReferralDto.additionalNotes ?? null,
        healthFacilityId: createReferralDto.healthFacilityId,
        status: ReferralStatus.PENDING,
      },
      include: {
        screening: {
          include: {
            client: true,
          },
        },
        healthFacility: true,
      },
    });

    // Track activity
    await this.activitiesService.trackActivity(
      user.id,
      {
        action: 'create',
        resource: 'referral',
        resourceId: referral.id,
        metadata: {
          screeningId: referral.screeningId,
          clientId: screening.clientId,
          clientName: `${screening.client.firstName} ${screening.client.lastName}`,
          healthFacilityId: referral.healthFacilityId,
          healthFacilityName: healthFacility.name,
        },
      },
      ipAddress,
      userAgent,
    );

    return referral;
  }

  async findAll(
    findReferralDto: FindReferralDto,
    originalUrl: string,
    user: UserSession['user'],
  ) {
    // Get the CHP for the current user
    const chp = await this.prismaService.communityHealthProvider.findUnique({
      where: { userId: user.id },
    });

    if (!chp) {
      throw new ForbiddenException('User is not a Community Health Provider');
    }

    const dbQuery: FunctionFirstArgument<
      typeof this.prismaService.referral.findMany
    > = {
      where: {
        AND: [
          {
            screening: {
              providerId: findReferralDto.providerId ?? chp.id,
              clientId: findReferralDto.clientId ?? undefined,
            },
          },
          {
            screeningId: findReferralDto.screeningId ?? undefined,
            healthFacilityId: findReferralDto.healthFacilityId ?? undefined,
            status: findReferralDto.status ?? undefined,
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        screening: true,
        healthFacility: true,
      },
      ...this.paginationService.buildPaginationQuery(findReferralDto),
    };

    const [data, totalCount] = await Promise.all([
      this.prismaService.referral.findMany(dbQuery),
      this.prismaService.referral.count(pick(dbQuery, 'where')),
    ]);

    return {
      results: data,
      ...this.paginationService.buildPaginationControls(
        totalCount,
        originalUrl,
        findReferralDto,
      ),
    };
  }

  async findOne(id: string, user: UserSession['user']) {
    // Get the CHP for the current user
    const chp = await this.prismaService.communityHealthProvider.findUnique({
      where: { userId: user.id },
    });

    if (!chp) {
      throw new ForbiddenException('User is not a Community Health Provider');
    }

    const referral = await this.prismaService.referral.findUnique({
      where: { id },
      include: {
        screening: {
          include: {
            client: true,
            provider: true,
          },
        },
        healthFacility: true,
      },
    });

    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    // Verify the referral belongs to this CHP's screening
    if (referral.screening.providerId !== chp.id) {
      throw new ForbiddenException(
        'You can only access referrals for your own screenings',
      );
    }

    return referral;
  }

  async update(
    id: string,
    updateReferralDto: UpdateReferralDto,
    user: UserSession['user'],
    ipAddress?: string,
    userAgent?: string,
  ) {
    const referral = await this.findOne(id, user);

    const updateData: {
      appointmentTime?: Date;
      additionalNotes?: string | null;
      healthFacilityId?: string;
    } = {};

    if (updateReferralDto.appointmentTime !== undefined) {
      updateData.appointmentTime = new Date(updateReferralDto.appointmentTime);
    }

    if (updateReferralDto.additionalNotes !== undefined) {
      updateData.additionalNotes = updateReferralDto.additionalNotes || null;
    }

    if (updateReferralDto.healthFacilityId !== undefined) {
      // Verify health facility exists
      const healthFacility = await this.prismaService.healthFacility.findUnique(
        {
          where: { id: updateReferralDto.healthFacilityId },
        },
      );

      if (!healthFacility) {
        throw new NotFoundException('Health facility not found');
      }

      updateData.healthFacilityId = updateReferralDto.healthFacilityId;
    }

    const updatedReferral = await this.prismaService.referral.update({
      where: { id: referral.id },
      data: updateData,
      include: {
        screening: {
          include: {
            client: true,
            provider: true,
          },
        },
        healthFacility: true,
      },
    });

    // Track activity
    await this.activitiesService.trackActivity(
      user.id,
      {
        action: 'update',
        resource: 'referral',
        resourceId: updatedReferral.id,
        metadata: {
          screeningId: updatedReferral.screeningId,
          clientId: updatedReferral.screening.clientId,
          clientName: `${updatedReferral.screening.client.firstName} ${updatedReferral.screening.client.lastName}`,
          healthFacilityId: updatedReferral.healthFacilityId,
          healthFacilityName: updatedReferral.healthFacility.name,
        },
      },
      ipAddress,
      userAgent,
    );

    return updatedReferral;
  }

  async complete(
    id: string,
    user: UserSession['user'],
    ipAddress?: string,
    userAgent?: string,
  ) {
    const referral = await this.findOne(id, user);

    if (referral.status === ReferralStatus.COMPLETED) {
      throw new NotFoundException('Referral is already completed');
    }

    if (referral.status === ReferralStatus.CANCELLED) {
      throw new NotFoundException('Cannot complete a cancelled referral');
    }

    const completedReferral = await this.prismaService.referral.update({
      where: { id: referral.id },
      data: {
        status: ReferralStatus.COMPLETED,
      },
      include: {
        screening: {
          include: {
            client: true,
          },
        },
        healthFacility: true,
      },
    });

    // Track activity
    await this.activitiesService.trackActivity(
      user.id,
      {
        action: 'complete',
        resource: 'referral',
        resourceId: completedReferral.id,
        metadata: {
          screeningId: completedReferral.screeningId,
          clientId: completedReferral.screening.clientId,
          clientName: `${completedReferral.screening.client.firstName} ${completedReferral.screening.client.lastName}`,
          healthFacilityId: completedReferral.healthFacilityId,
          healthFacilityName: completedReferral.healthFacility.name,
        },
      },
      ipAddress,
      userAgent,
    );

    return completedReferral;
  }

  async cancel(
    id: string,
    user: UserSession['user'],
    ipAddress?: string,
    userAgent?: string,
  ) {
    const referral = await this.findOne(id, user);

    if (referral.status === ReferralStatus.CANCELLED) {
      throw new NotFoundException('Referral is already cancelled');
    }

    if (referral.status === ReferralStatus.COMPLETED) {
      throw new NotFoundException('Cannot cancel a completed referral');
    }

    const cancelledReferral = await this.prismaService.referral.update({
      where: { id: referral.id },
      data: {
        status: ReferralStatus.CANCELLED,
      },
      include: {
        screening: {
          include: {
            client: true,
          },
        },
        healthFacility: true,
      },
    });

    // Track activity
    await this.activitiesService.trackActivity(
      user.id,
      {
        action: 'cancel',
        resource: 'referral',
        resourceId: cancelledReferral.id,
        metadata: {
          screeningId: cancelledReferral.screeningId,
          clientId: cancelledReferral.screening.clientId,
          clientName: `${cancelledReferral.screening.client.firstName} ${cancelledReferral.screening.client.lastName}`,
          healthFacilityId: cancelledReferral.healthFacilityId,
          healthFacilityName: cancelledReferral.healthFacility.name,
        },
      },
      ipAddress,
      userAgent,
    );

    return cancelledReferral;
  }

  async delete(
    id: string,
    user: UserSession['user'],
    ipAddress?: string,
    userAgent?: string,
  ) {
    const referral = await this.findOne(id, user);
    const referralData = {
      id: referral.id,
      screeningId: referral.screeningId,
      clientId: referral.screening.clientId,
      clientName: `${referral.screening.client.firstName} ${referral.screening.client.lastName}`,
      healthFacilityId: referral.healthFacilityId,
      healthFacilityName: referral.healthFacility.name,
    };

    await this.prismaService.referral.delete({
      where: { id: referral.id },
    });

    // Track activity
    await this.activitiesService.trackActivity(
      user.id,
      {
        action: 'delete',
        resource: 'referral',
        resourceId: id,
        metadata: referralData,
      },
      ipAddress,
      userAgent,
    );

    return { id, deleted: true };
  }
}
