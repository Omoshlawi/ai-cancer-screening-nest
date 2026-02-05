import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { pick } from 'lodash';
import { BetterAuthWithPlugins, UserSession } from '../auth/auth.types';
import { FunctionFirstArgument } from '../common/common.types';
import { PaginationService } from '../common/pagination.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, FindClientDto, UpdateClientDto } from './client.dto';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService<BetterAuthWithPlugins>,
    private readonly paginationService: PaginationService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create(
    createClientDto: CreateClientDto,
    user: UserSession['user'],
    ipAddress?: string,
    userAgent?: string,
  ) {
    let chp = await this.prismaService.communityHealthProvider.findUnique({
      where: { userId: user.id },
    });

    const userRole = Array.isArray(user.role) ? user.role[0] : user.role;
    if (!chp && userRole?.toLowerCase() === 'admin') {
      // If Admin creates client, assign to first available CHP to satisfy DB constraint
      chp = await this.prismaService.communityHealthProvider.findFirst();
    }

    if (!chp) {
      throw new NotFoundException('Community health provider not found');
    }

    const clientWithSimilarNo = await this.prismaService.client.findFirst({
      where: { phoneNumber: createClientDto.phoneNumber },
    });

    if (clientWithSimilarNo) {
      throw new BadRequestException('Client with similar phone number exist');
    }

    const client = await this.prismaService.client.create({
      data: {
        firstName: createClientDto.firstName,
        lastName: createClientDto.lastName,
        dateOfBirth: createClientDto.dateOfBirth,
        phoneNumber: createClientDto.phoneNumber,
        county: createClientDto.county,
        subcounty: createClientDto.subcounty,
        ward: createClientDto.ward,
        nationalId: createClientDto.nationalId,
        maritalStatus: createClientDto.maritalStatus,
        createdById: chp.id,
      },
    });

    // Track activity
    await this.activitiesService.trackActivity(
      user.id,
      {
        action: 'create',
        resource: 'client',
        resourceId: client.id,
        metadata: {
          clientName: `${client.firstName} ${client.lastName}`,
          clientId: client.id,
        },
      },
      ipAddress,
      userAgent,
    );

    return client;
  }

  async findAll(findClientDto: FindClientDto, originalUrl: string) {
    const dbQuery: FunctionFirstArgument<
      typeof this.prismaService.client.findMany
    > = {
      where: {
        AND: [
          {
            phoneNumber: findClientDto.phoneNumber ?? undefined,
            nationalId: findClientDto.nationalId ?? undefined,
            createdById: findClientDto.createdById ?? undefined,
            metadata: findClientDto.risk
              ? {
                  path: ['riskInterpretation'],
                  equals: findClientDto.risk,
                }
              : undefined,
            createdBy: {
              userId: findClientDto.createdByUserId,
            },
          },
          {
            OR: findClientDto.name
              ? [
                  {
                    firstName: {
                      contains: findClientDto.name,
                      mode: 'insensitive',
                    },
                  },
                  {
                    lastName: {
                      contains: findClientDto.name,
                      mode: 'insensitive',
                    },
                  },
                ]
              : undefined,
          },
          {
            OR: findClientDto.search
              ? [
                  {
                    firstName: {
                      contains: findClientDto.search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    lastName: {
                      contains: findClientDto.search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    phoneNumber: {
                      contains: findClientDto.search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    nationalId: {
                      contains: findClientDto.search,
                      mode: 'insensitive',
                    },
                  },
                ]
              : undefined,
          },
        ],
      },
      orderBy: findClientDto.sortBy
        ? {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            [findClientDto.sortBy]: this.paginationService.getSortOrder(
              findClientDto.sortOrder,
            ),
          }
        : { createdAt: 'desc' },
      include: {
        screenings: {
          select: {
            id: true,
            createdAt: true,
            scoringResult: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      ...this.paginationService.buildPaginationQuery(findClientDto),
    };
    const [data, totalCount] = await Promise.all([
      this.prismaService.client.findMany(dbQuery),
      this.prismaService.client.count(pick(dbQuery, 'where')),
    ]);
    return {
      results: data,
      ...this.paginationService.buildPaginationControls(
        totalCount,
        originalUrl,
        findClientDto,
      ),
    };
  }

  async findOne(id: string) {
    const client = await this.prismaService.client.findUnique({
      where: { id },
      include: {
        screenings: {
          select: {
            id: true,
            createdAt: true,
            scoringResult: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async update(
    id: string,
    updateClientDto: UpdateClientDto,
    user?: UserSession['user'],
    ipAddress?: string,
    userAgent?: string,
  ) {
    const client = await this.findOne(id);
    const updatedClient = await this.prismaService.client.update({
      where: { id: client.id },
      data: updateClientDto,
    });

    // Track activity if user is provided
    if (user) {
      await this.activitiesService.trackActivity(
        user.id,
        {
          action: 'update',
          resource: 'client',
          resourceId: updatedClient.id,
          metadata: {
            clientName: `${updatedClient.firstName} ${updatedClient.lastName}`,
            clientId: updatedClient.id,
          },
        },
        ipAddress,
        userAgent,
      );
    }

    return updatedClient;
  }

  async delete(
    id: string,
    user?: UserSession['user'],
    ipAddress?: string,
    userAgent?: string,
  ) {
    const client = await this.findOne(id);
    const clientName = `${client.firstName} ${client.lastName}`;
    await this.prismaService.client.delete({
      where: { id: client.id },
    });

    // Track activity if user is provided
    if (user) {
      await this.activitiesService.trackActivity(
        user.id,
        {
          action: 'delete',
          resource: 'client',
          resourceId: id,
          metadata: {
            clientName,
            clientId: id,
          },
        },
        ipAddress,
        userAgent,
      );
    }

    return { id, deleted: true };
  }
}
