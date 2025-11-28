/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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

@Injectable()
export class ReferralService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async create(
    createReferralDto: CreateReferralDto,
    user: UserSession['user'],
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

    return this.prismaService.referral.create({
      data: {
        screeningId: createReferralDto.screeningId,
        appointmentTime: new Date(createReferralDto.appointmentTime),
        additionalNotes: createReferralDto.additionalNotes ?? null,
        healthFacilityId: createReferralDto.healthFacilityId,
        status: createReferralDto.status ?? ReferralStatus.PENDING,
      },
      include: {
        screening: true,
        healthFacility: true,
      },
    });
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
              providerId: chp.id, // Only show referrals for this CHP's screenings
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
        screening: true,
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
  ) {
    const referral = await this.findOne(id, user);

    const updateData: {
      appointmentTime?: Date;
      additionalNotes?: string | null;
      healthFacilityId?: string;
      status?: ReferralStatus;
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

    if (updateReferralDto.status !== undefined) {
      updateData.status = updateReferralDto.status;
    }

    return await this.prismaService.referral.update({
      where: { id: referral.id },
      data: updateData,
      include: {
        screening: true,
        healthFacility: true,
      },
    });
  }

  async delete(id: string, user: UserSession['user']) {
    const referral = await this.findOne(id, user);
    return await this.prismaService.referral.delete({
      where: { id: referral.id },
    });
  }
}
