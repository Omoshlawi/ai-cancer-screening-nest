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
  CreateHealthFacilityTypeDto,
  FindHealthFacilityTypeDto,
  UpdateHealthFacilityTypeDto,
} from './health-facility-type.dto';

@Injectable()
export class HealthFacilityTypeService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  create(createHealthFacilityTypeDto: CreateHealthFacilityTypeDto) {
    return this.prismaService.healthFacilityType.create({
      data: {
        name: createHealthFacilityTypeDto.name,
        description: createHealthFacilityTypeDto.description ?? null,
      },
      include: {
        healthFacilities: true,
      },
    });
  }

  async findAll(
    findHealthFacilityTypeDto: FindHealthFacilityTypeDto,
    originalUrl: string,
  ) {
    const dbQuery: FunctionFirstArgument<
      typeof this.prismaService.healthFacilityType.findMany
    > = {
      where: {
        OR: findHealthFacilityTypeDto.search
          ? [
              {
                name: {
                  contains: findHealthFacilityTypeDto.search,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: findHealthFacilityTypeDto.search,
                  mode: 'insensitive',
                },
              },
            ]
          : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        healthFacilities: true,
      },
      ...this.paginationService.buildPaginationQuery(findHealthFacilityTypeDto),
    };
    const [data, totalCount] = await Promise.all([
      this.prismaService.healthFacilityType.findMany(dbQuery),
      this.prismaService.healthFacilityType.count(pick(dbQuery, 'where')),
    ]);
    return {
      results: data,
      ...this.paginationService.buildPaginationControls(
        totalCount,
        originalUrl,
        findHealthFacilityTypeDto,
      ),
    };
  }

  async findOne(id: string) {
    const healthFacilityType =
      await this.prismaService.healthFacilityType.findUnique({
        where: { id },
        include: {
          healthFacilities: true,
        },
      });
    if (!healthFacilityType) {
      throw new NotFoundException('Health facility type not found');
    }
    return healthFacilityType;
  }

  async update(
    id: string,
    updateHealthFacilityTypeDto: UpdateHealthFacilityTypeDto,
  ) {
    const healthFacilityType = await this.findOne(id);
    return await this.prismaService.healthFacilityType.update({
      where: { id: healthFacilityType.id },
      data: updateHealthFacilityTypeDto,
      include: {
        healthFacilities: true,
      },
    });
  }

  async delete(id: string) {
    const healthFacilityType = await this.findOne(id);
    return await this.prismaService.healthFacilityType.delete({
      where: { id: healthFacilityType.id },
    });
  }
}
