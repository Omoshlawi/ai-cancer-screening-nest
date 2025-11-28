/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { pick } from 'lodash';
import { FunctionFirstArgument } from '../common/common.types';
import { PaginationService } from '../common/pagination.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateHealthFacilityDto,
  FindHealthFacilityDto,
  UpdateHealthFacilityDto,
} from './health-facility.dto';

@Injectable()
export class HealthFacilityService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  create(createHealthFacilityDto: CreateHealthFacilityDto) {
    return this.prismaService.healthFacility.create({
      data: {
        name: createHealthFacilityDto.name,
        address: createHealthFacilityDto.address,
        phoneNumber: createHealthFacilityDto.phoneNumber,
        email: createHealthFacilityDto.email,
        logo: createHealthFacilityDto.logo,
        coordinates: createHealthFacilityDto.coordinates as any,
      },
      include: {
        referrals: true,
      },
    });
  }

  async findAll(
    findHealthFacilityDto: FindHealthFacilityDto,
    originalUrl: string,
  ) {
    const dbQuery: FunctionFirstArgument<
      typeof this.prismaService.healthFacility.findMany
    > = {
      where: {
        AND: [
          {
            name: findHealthFacilityDto.name ?? undefined,
            email: findHealthFacilityDto.email ?? undefined,
          },
          {
            OR: findHealthFacilityDto.search
              ? [
                  {
                    name: {
                      contains: findHealthFacilityDto.search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    address: {
                      contains: findHealthFacilityDto.search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    email: {
                      contains: findHealthFacilityDto.search,
                      mode: 'insensitive',
                    },
                  },
                ]
              : undefined,
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        referrals: true,
      },
      ...this.paginationService.buildPaginationQuery(findHealthFacilityDto),
    };
    const [data, totalCount] = await Promise.all([
      this.prismaService.healthFacility.findMany(dbQuery),
      this.prismaService.healthFacility.count(pick(dbQuery, 'where')),
    ]);
    return {
      results: data,
      ...this.paginationService.buildPaginationControls(
        totalCount,
        originalUrl,
        findHealthFacilityDto,
      ),
    };
  }

  async findOne(id: string) {
    const healthFacility = await this.prismaService.healthFacility.findUnique({
      where: { id },
      include: {
        referrals: true,
      },
    });
    if (!healthFacility) {
      throw new NotFoundException('Health facility not found');
    }
    return healthFacility;
  }

  async update(id: string, updateHealthFacilityDto: UpdateHealthFacilityDto) {
    const healthFacility = await this.findOne(id);
    return await this.prismaService.healthFacility.update({
      where: { id: healthFacility.id },
      data: {
        ...updateHealthFacilityDto,
        coordinates: updateHealthFacilityDto.coordinates as any,
      },
      include: {
        referrals: true,
      },
    });
  }

  async delete(id: string) {
    const healthFacility = await this.findOne(id);
    return await this.prismaService.healthFacility.delete({
      where: { id: healthFacility.id },
    });
  }
}
