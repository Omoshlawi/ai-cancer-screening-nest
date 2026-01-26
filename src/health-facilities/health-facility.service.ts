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
  // Default configuration constants for nearest facility search
  // These are used as fallbacks when query parameters are not provided
  private static readonly DEFAULT_NEAREST_FACILITY_CONFIG = {
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
        county: createHealthFacilityDto.county,
        subcounty: createHealthFacilityDto.subcounty,
        ward: createHealthFacilityDto.ward,
        phoneNumber: createHealthFacilityDto.phoneNumber,
        email: createHealthFacilityDto.email,
        logo: createHealthFacilityDto.logo,
        coordinates: createHealthFacilityDto.coordinates as any,
        typeId: createHealthFacilityDto.typeId,
        kmflCode: createHealthFacilityDto.kmflCode,
        owner: createHealthFacilityDto.owner,
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
            kmflCode: findHealthFacilityDto.kmflCode ?? undefined,
            county: findHealthFacilityDto.county ?? undefined,
            subcounty: findHealthFacilityDto.subcounty ?? undefined,
            ward: findHealthFacilityDto.ward ?? undefined,
          },
          {
            OR: findHealthFacilityDto.search
              ? [
                  {
                    kmflCode: {
                      contains: findHealthFacilityDto.search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    name: {
                      contains: findHealthFacilityDto.search,
                      mode: 'insensitive',
                    },
                  },
                ]
              : undefined,
          },
          {
            OR: findHealthFacilityDto.location
              ? [
                  {
                    county: {
                      contains: findHealthFacilityDto.location,
                      mode: 'insensitive',
                    },
                  },
                  {
                    subcounty: {
                      contains: findHealthFacilityDto.location,
                      mode: 'insensitive',
                    },
                  },
                  {
                    ward: {
                      contains: findHealthFacilityDto.location,
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
    const {
      lat,
      lng,
      targetCount: targetCountParam,
      maxDistanceKm: maxDistanceKmParam,
      initialDistanceKm: initialDistanceKmParam,
      distanceIncrementKm: distanceIncrementKmParam,
      fetchMultiplier: fetchMultiplierParam,
    } = findNearestHealthFacilityDto;

    // Use query parameters if provided, otherwise use defaults
    const {
      TARGET_COUNT: defaultTargetCount,
      MAX_DISTANCE_KM: defaultMaxDistanceKm,
      INITIAL_DISTANCE_KM: defaultInitialDistanceKm,
      DISTANCE_INCREMENT_KM: defaultDistanceIncrementKm,
      FETCH_MULTIPLIER: defaultFetchMultiplier,
    } = HealthFacilityService.DEFAULT_NEAREST_FACILITY_CONFIG;

    const targetCount = targetCountParam ?? defaultTargetCount;
    const maxDistanceKm = maxDistanceKmParam ?? defaultMaxDistanceKm;
    const initialDistanceKm =
      initialDistanceKmParam ?? defaultInitialDistanceKm;
    const distanceIncrementKm =
      distanceIncrementKmParam ?? defaultDistanceIncrementKm;
    const fetchMultiplier = fetchMultiplierParam ?? defaultFetchMultiplier;

    const centerPoint = turf.point([lng, lat]);
    let currentDistanceKm = initialDistanceKm;
    let facilitiesWithDistance: Array<{
      facility: HealthFacility & { type: HealthFacilityType };
      distanceKm: number;
    }> = [];

    // Iteratively increase search radius until we find targetCount facilities
    // This approach is efficient for large datasets because:
    // 1. Bounding box filtering reduces the search space before distance calculation
    // 2. We only fetch a limited number of candidates per iteration
    // 3. The search stops as soon as enough facilities are found
    while (
      facilitiesWithDistance.length < targetCount &&
      currentDistanceKm <= maxDistanceKm
    ) {
      const bbox = this.calculateBoundingBox(lat, lng, currentDistanceKm);

      // Use Prisma to filter facilities within bounding box
      // Prisma JSON path queries for filtering by latitude/longitude
      // This bounding box filter significantly reduces the dataset before distance calculation
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
            {
              typeId: findNearestHealthFacilityDto.typeId ?? undefined,
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

      // Filter to only include facilities within the current radius AND maxDistanceKm
      // This ensures maxDistanceKm is always respected, even if currentDistanceKm exceeds it
      const facilitiesWithinRadius = facilitiesInRadius.filter(
        (f) =>
          f.distanceKm <= currentDistanceKm && f.distanceKm <= maxDistanceKm,
      );

      // Sort by distance
      facilitiesWithinRadius.sort((a, b) => a.distanceKm - b.distanceKm);

      // Add new facilities to existing results, avoiding duplicates
      const existingIds = new Set(
        facilitiesWithDistance.map((f) => f.facility.id),
      );
      const newFacilities = facilitiesWithinRadius.filter(
        (f) => !existingIds.has(f.facility.id),
      );

      // Combine with existing results and sort again
      facilitiesWithDistance = [
        ...facilitiesWithDistance,
        ...newFacilities,
      ].sort((a, b) => a.distanceKm - b.distanceKm);

      // Take only the targetCount nearest facilities
      facilitiesWithDistance = facilitiesWithDistance.slice(0, targetCount);

      // If we found enough facilities within maxDistanceKm, break the loop
      if (facilitiesWithDistance.length >= targetCount) {
        break;
      }

      // If currentDistanceKm exceeds maxDistanceKm, stop searching
      if (currentDistanceKm >= maxDistanceKm) {
        break;
      }

      // Increase search radius for next iteration
      currentDistanceKm += distanceIncrementKm;
    }

    if (!facilitiesWithDistance || facilitiesWithDistance.length === 0) {
      throw new NotFoundException('No health facilities found');
    }

    // Final filter: ensure all results are within maxDistanceKm and limit to targetCount
    // This is a safety check to ensure maxDistanceKm is always respected
    const filteredResults = facilitiesWithDistance
      .filter((item) => item.distanceKm <= maxDistanceKm)
      .slice(0, targetCount);

    if (filteredResults.length === 0) {
      throw new NotFoundException(
        `No health facilities found within ${maxDistanceKm}km`,
      );
    }

    // Format results with distance
    const results = filteredResults.map((item) => {
      return {
        ...item.facility,
        distanceKm: Number(item.distanceKm.toFixed(2)),
      };
    });

    // Return array of targetCount nearest facilities (or fewer if not enough exist within maxDistanceKm)
    return { results };
  }
}
