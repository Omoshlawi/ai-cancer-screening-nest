/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { pick } from 'lodash';
import * as turf from '@turf/turf';
import { FunctionFirstArgument } from '../common/common.types';
import { PaginationService } from '../common/pagination.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateHealthFacilityDto,
  FindHealthFacilityDto,
  UpdateHealthFacilityDto,
  FindNearestHealthFacilityDto,
} from './health-facility.dto';
import {
  HealthFacility,
  HealthFacilityType,
} from '../../generated/prisma/browser';

@Injectable()
export class HealthFacilityService {
  // Configuration constants for nearest facility search
  private static readonly NEAREST_FACILITY_CONFIG = {
    /** Number of nearest facilities to return */
    TARGET_COUNT: 10,
    /** Maximum search radius in kilometers (safety limit) */
    MAX_DISTANCE_KM: 1000,
    /** Initial search radius in kilometers */
    INITIAL_DISTANCE_KM: 5,
    /** Distance increment in kilometers for each iteration */
    DISTANCE_INCREMENT_KM: 5,
    /** Multiplier for fetching facilities (to account for distance filtering) */
    FETCH_MULTIPLIER: 3,
  } as const;

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

  /**
   * Calculate bounding box (min/max lat/lng) for a given center point and distance in kilometers
   * Uses TurfJS to create a circle and extract its bounding box
   */
  private calculateBoundingBox(
    centerLat: number,
    centerLng: number,
    distanceKm: number,
  ): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
    const center = turf.point([centerLng, centerLat]);
    const circle = turf.circle(center, distanceKm, { units: 'kilometers' });
    const bbox = turf.bbox(circle);

    // bbox format: [minLng, minLat, maxLng, maxLat]
    return {
      minLng: bbox[0],
      minLat: bbox[1],
      maxLng: bbox[2],
      maxLat: bbox[3],
    };
  }

  /**
   * Find the nearest health facilities to a given location
   * @param findNearestHealthFacilityDto - The latitude and longitude of the location to find the nearest health facilities to
   * @returns The nearest health facilities to the given location
   */

  async findNearest(
    findNearestHealthFacilityDto: FindNearestHealthFacilityDto,
  ) {
    const { lat, lng } = findNearestHealthFacilityDto;
    const {
      TARGET_COUNT: targetCount,
      MAX_DISTANCE_KM: maxDistanceKm,
      INITIAL_DISTANCE_KM: initialDistanceKm,
      DISTANCE_INCREMENT_KM: distanceIncrementKm,
      FETCH_MULTIPLIER: fetchMultiplier,
    } = HealthFacilityService.NEAREST_FACILITY_CONFIG;

    const centerPoint = turf.point([lng, lat]);
    let currentDistanceKm = initialDistanceKm;
    let facilitiesWithDistance: Array<{
      facility: HealthFacility & { type: HealthFacilityType };
      distanceKm: number;
    }> = [];

    // Iteratively increase search radius until we find 10 facilities
    while (
      facilitiesWithDistance.length < targetCount &&
      currentDistanceKm <= maxDistanceKm
    ) {
      const bbox = this.calculateBoundingBox(lat, lng, currentDistanceKm);

      // Use Prisma to filter facilities within bounding box
      // Prisma JSON path queries for filtering by latitude/longitude
      const facilities = await this.prismaService.healthFacility.findMany({
        where: {
          AND: [
            {
              coordinates: {
                path: ['latitude'],
                gte: bbox.minLat,
              },
            },
            {
              coordinates: {
                path: ['latitude'],
                lte: bbox.maxLat,
              },
            },
            {
              coordinates: {
                path: ['longitude'],
                gte: bbox.minLng,
              },
            },
            {
              coordinates: {
                path: ['longitude'],
                lte: bbox.maxLng,
              },
            },
          ],
        },
        include: {
          type: true,
        },
        // Fetch more than needed to account for distance filtering
        take: targetCount * fetchMultiplier,
      });

      // Calculate distances using TurfJS and add to results
      const facilitiesInRadius = facilities
        .map((facility) => {
          const coords = facility.coordinates as {
            latitude: number;
            longitude: number;
          };
          if (!coords?.latitude || !coords?.longitude) {
            return null;
          }

          const facilityPoint = turf.point([coords.longitude, coords.latitude]);
          const distanceKm = turf.distance(centerPoint, facilityPoint, {
            units: 'kilometers',
          });

          return {
            facility,
            distanceKm,
          };
        })
        .filter(
          (
            f,
          ): f is {
            facility: (typeof facilities)[0];
            distanceKm: number;
          } => f !== null,
        );

      // Filter to only include facilities within the current radius
      const facilitiesWithinRadius = facilitiesInRadius.filter(
        (f) => f.distanceKm <= currentDistanceKm,
      );

      // Sort by distance and add to our results
      facilitiesWithinRadius.sort((a, b) => a.distanceKm - b.distanceKm);
      facilitiesWithDistance = facilitiesWithinRadius.slice(0, targetCount);

      // If we found enough facilities, break the loop
      if (facilitiesWithDistance.length >= targetCount) {
        break;
      }

      // Increase search radius for next iteration
      currentDistanceKm += distanceIncrementKm;
    }

    if (!facilitiesWithDistance || facilitiesWithDistance.length === 0) {
      throw new NotFoundException('No health facilities found');
    }

    // Take only the first 10 facilities (sorted by distance)
    const nearestFacilities = facilitiesWithDistance.slice(0, targetCount);

    // Format results with distance
    const results = nearestFacilities.map((item) => {
      return {
        ...item.facility,
        distanceKm: Number(item.distanceKm.toFixed(2)),
      };
    });

    // Return array of 10 nearest facilities (or fewer if not enough exist)
    return { results };
  }
}
