import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { pick } from 'lodash';
import { PaginationService } from '../common/pagination.service';
import { FunctionFirstArgument } from '../common/common.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProviderFacilityDto,
  FindProviderFacilityDto,
} from './provider-facility.dto';

@Injectable()
export class ProviderFacilityService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async create(dto: CreateProviderFacilityDto) {
    const provider = await this.prismaService.healthProvider.findUnique({
      where: { id: dto.providerId },
    });
    if (!provider) {
      throw new NotFoundException('Health provider not found');
    }

    const facility = await this.prismaService.healthFacility.findUnique({
      where: { id: dto.facilityId },
    });
    if (!facility) {
      throw new NotFoundException('Health facility not found');
    }

    const existing = await this.prismaService.providerFacility.findUnique({
      where: {
        providerId_facilityId: {
          providerId: dto.providerId,
          facilityId: dto.facilityId,
        },
      },
    });
    if (existing) {
      throw new BadRequestException(
        'This provider is already mapped to this facility',
      );
    }

    return this.prismaService.providerFacility.create({
      data: { providerId: dto.providerId, facilityId: dto.facilityId },
      include: { provider: true, facility: true },
    });
  }

  async findAll(dto: FindProviderFacilityDto, originalUrl: string) {
    const dbQuery: FunctionFirstArgument<
      typeof this.prismaService.providerFacility.findMany
    > = {
      where: {
        providerId: dto.providerId ?? undefined,
        facilityId: dto.facilityId ?? undefined,
      },
      orderBy: { createdAt: 'desc' },
      ...this.paginationService.buildPaginationQuery(dto),
    };

    const [data, totalCount] = await Promise.all([
      this.prismaService.providerFacility.findMany({
        ...dbQuery,
        include: { provider: { include: { user: true } }, facility: true },
      }),
      this.prismaService.providerFacility.count(pick(dbQuery, 'where')),
    ]);

    return {
      results: data,
      ...this.paginationService.buildPaginationControls(
        totalCount,
        originalUrl,
        dto,
      ),
    };
  }

  async findMyFacilities(userId: string) {
    const provider = await this.prismaService.healthProvider.findUnique({
      where: { userId },
    });
    if (!provider) {
      return [];
    }

    const mappings = await this.prismaService.providerFacility.findMany({
      where: { providerId: provider.id },
      include: { facility: true },
    });

    return mappings.map((m) => m.facility);
  }

  async delete(id: string) {
    const mapping = await this.prismaService.providerFacility.findUnique({
      where: { id },
    });
    if (!mapping) {
      throw new NotFoundException('Provider-facility mapping not found');
    }

    return this.prismaService.providerFacility.delete({ where: { id } });
  }
}
