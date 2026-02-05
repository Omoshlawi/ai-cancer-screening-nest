import { Injectable } from '@nestjs/common';
import { pick } from 'lodash';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationService } from '../common/pagination.service';
import { FindAddressHierarchyDto } from './address-hierarchy.dto';
import { FunctionFirstArgument } from '../common/common.types';

@Injectable()
export class AddressHierarchyService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginationService: PaginationService,
  ) { }

  async findAll(query: FindAddressHierarchyDto, originalUrl: string) {
    const where: any = {
      AND: [],
    };

    // Base filters
    const baseFilters: any = {};
    if (query?.country) baseFilters.country = query.country;
    if (query?.level !== undefined) baseFilters.level = query.level;
    if (query?.code) baseFilters.code = query.code;
    if (query?.name) baseFilters.name = query.name;
    if (query?.nameLocal) baseFilters.nameLocal = query.nameLocal;
    if (query?.parentId) baseFilters.parentId = query.parentId;

    if (Object.keys(baseFilters).length > 0) {
      where.AND.push(baseFilters);
    }

    // Parent filters
    const parentFilters: any = {};
    if (query?.parentCode) parentFilters.code = query.parentCode;
    if (query?.parentCountry) parentFilters.country = query.parentCountry;
    if (query?.parentLevel !== undefined) parentFilters.level = query.parentLevel;
    if (query?.parentName) parentFilters.name = query.parentName;
    if (query?.parentNameLocal) parentFilters.nameLocal = query.parentNameLocal;

    if (Object.keys(parentFilters).length > 0) {
      where.AND.push({ parent: parentFilters });
    }

    // Search filter
    // Search filter
    if (query.search) {
      console.log(`[AddressHierarchy] Searching for: "${query.search}"`);
      where.AND.push({
        OR: [
          {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
          {
            code: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
          {
            nameLocal: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    const dbQuery: any = {
      where,
      ...this.paginationService.buildPaginationQuery(query),
    };
    const [data, totalCount] = await Promise.all([
      this.prismaService.addressHierarchy.findMany(dbQuery),
      this.prismaService.addressHierarchy.count({ where }),
    ]);
    return {
      results: data,
      ...this.paginationService.buildPaginationControls(
        totalCount,
        originalUrl,
        query,
      ),
    };
  }

  async delete(id: string) {
    return await this.prismaService.addressHierarchy.delete({
      where: { id },
    });
  }
}
