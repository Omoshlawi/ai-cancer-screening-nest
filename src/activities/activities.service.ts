/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { pick } from 'lodash';
import { PaginationService } from '../common/pagination.service';
import { PrismaService } from '../prisma/prisma.service';
import { FunctionFirstArgument } from '../common/common.types';
import { CreateActivityDto, FindActivitiesDto } from './activities.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginationService: PaginationService,
  ) { }

  /**
   * Generate a human-readable description for an activity
   */
  private generateDescription(
    action: string,
    resource: string,
    metadata?: any,
  ): string {
    const actionMap: Record<string, string> = {
      create: 'Created',
      update: 'Updated',
      delete: 'Deleted',
      view: 'Viewed',
      read: 'Viewed',
      approve: 'Approved',
      reject: 'Rejected',
      cancel: 'Cancelled',
      complete: 'Completed',
    };

    const resourceMap: Record<string, string> = {
      screening: 'screening',
      client: 'client',
      referral: 'referral',
      user: 'user',
      healthFacility: 'health facility',
      health_facility: 'health facility',
    };

    const actionText = actionMap[action.toLowerCase()] || action;
    const resourceText = resourceMap[resource.toLowerCase()] || resource;

    // Build base description
    let description = `${actionText} ${resourceText}`;

    // Add context from metadata if available
    if (metadata) {
      if (metadata.clientName) {
        description += ` for ${metadata.clientName}`;
      } else if (metadata.clientId) {
        description += ` (Client ID: ${metadata.clientId})`;
      }
      if (metadata.screeningId) {
        description += ` (Screening ID: ${metadata.screeningId})`;
      }
    }

    return description;
  }

  /**
   * Track and save a user activity
   */
  async trackActivity(
    userId: string,
    createActivityDto: CreateActivityDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const description = this.generateDescription(
      createActivityDto.action,
      createActivityDto.resource,
      createActivityDto.metadata,
    );

    return await this.prismaService.userActivity.create({
      data: {
        userId,
        action: createActivityDto.action,
        resource: createActivityDto.resource,
        resourceId: createActivityDto.resourceId,
        metadata: createActivityDto.metadata as any,
        description,
        ipAddress,
        userAgent,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find recent activities with optional filters
   */
  async findRecent(findActivitiesDto: FindActivitiesDto, originalUrl: string) {
    const dbQuery: FunctionFirstArgument<
      typeof this.prismaService.userActivity.findMany
    > = {
      where: {
        userId: findActivitiesDto.userId ?? undefined,
        action: findActivitiesDto.action ?? undefined,
        resource: findActivitiesDto.resource ?? undefined,
        resourceId: findActivitiesDto.resourceId ?? undefined,
        createdAt: {
          gte: findActivitiesDto.dateFrom
            ? new Date(findActivitiesDto.dateFrom)
            : undefined,
          lte: findActivitiesDto.dateTo
            ? new Date(findActivitiesDto.dateTo)
            : undefined,
        },
      },
      orderBy: findActivitiesDto.sortBy
        ? { [findActivitiesDto.sortBy]: this.paginationService.getSortOrder(findActivitiesDto.sortOrder) }
        : { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      ...this.paginationService.buildPaginationQuery(findActivitiesDto),
    };

    const [data, totalCount] = await Promise.all([
      this.prismaService.userActivity.findMany(dbQuery),
      this.prismaService.userActivity.count(pick(dbQuery, 'where')),
    ]);

    return {
      results: data,
      ...this.paginationService.buildPaginationControls(
        totalCount,
        originalUrl,
        findActivitiesDto,
      ),
    };
  }
}
