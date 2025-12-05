/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { pick } from 'lodash';
import { FunctionFirstArgument } from '../common/common.types';
import { PaginationService } from '../common/pagination.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateHealthFacilityDto,
  FindHealthFacilityDto,
  UpdateHealthFacilityDto,
  FindNearestHealthFacilityDto,
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
        typeId: createHealthFacilityDto.typeId,
      },
      include: {
        referrals: true,
        type: true,
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
            typeId: findHealthFacilityDto.typeId ?? undefined,
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
        type: true,
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
        type: true,
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
        typeId: updateHealthFacilityDto.typeId ?? healthFacility.typeId,
        coordinates:
          updateHealthFacilityDto.coordinates ??
          (healthFacility.coordinates as any),
      },
      include: {
        referrals: true,
        type: true,
      },
    });
  }

  async delete(id: string) {
    const healthFacility = await this.findOne(id);
    return await this.prismaService.healthFacility.delete({
      where: { id: healthFacility.id },
    });
  }

  async findNearest(
    findNearestHealthFacilityDto: FindNearestHealthFacilityDto,
  ) {
    const { lat, lng } = findNearestHealthFacilityDto;

    // Use raw SQL query with Haversine formula for efficient distance calculation
    // This is much more efficient than loading all facilities and calculating in application code
    const result = await this.prismaService.$queryRaw<
      Array<{
        id: string;
        name: string;
        address: string;
        phoneNumber: string;
        email: string;
        logo: string;
        coordinates: { latitude: number; longitude: number };
        typeId: string | null;
        createdAt: Date;
        updatedAt: Date;
        distanceKm: number;
      }>
    >`
      SELECT 
        hf.*,
        (
          6371 * acos(
            cos(radians(${lat})) *
            cos(radians((hf.coordinates->>'latitude')::float)) *
            cos(radians((hf.coordinates->>'longitude')::float) - radians(${lng})) +
            sin(radians(${lat})) *
            sin(radians((hf.coordinates->>'latitude')::float))
          )
        ) AS "distanceKm"
      FROM "HealthFacility" hf
      WHERE hf.coordinates IS NOT NULL
        AND hf.coordinates->>'latitude' IS NOT NULL
        AND hf.coordinates->>'longitude' IS NOT NULL
      ORDER BY "distanceKm" ASC
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      throw new NotFoundException('No health facility found');
    }

    const nearestFacility = result[0];

    // Fetch related data (type and referrals) using Prisma
    const facilityWithRelations =
      await this.prismaService.healthFacility.findUnique({
        where: { id: nearestFacility.id },
        include: {
          referrals: true,
          type: true,
        },
      });

    if (!facilityWithRelations) {
      throw new NotFoundException('Health facility not found');
    }

    return {
      ...facilityWithRelations,
      distanceKm: Number(nearestFacility.distanceKm.toFixed(2)),
    };
  }
}
