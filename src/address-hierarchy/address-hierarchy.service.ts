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
  ) {}

  async findAll(query: FindAddressHierarchyDto, originalUrl: string) {
    const dbQuery: FunctionFirstArgument<
      typeof this.prismaService.addressHierarchy.findMany
    > = {
      where: {
        AND: [
          {
            country: query?.country,
            level: query?.level,
            code: query?.code,
            name: query?.name,
            nameLocal: query?.nameLocal,
            parentId: query?.parentId,
            parent: {
              code: query?.parentCode,
              country: query?.parentCountry,
              level: query?.parentLevel,
              name: query?.parentName,
              nameLocal: query?.parentNameLocal,
            },
          },
          {
            OR: query.search
              ? [
                  {
                    name: {
                      contains: query.search, //mode: 'insensitive'
                    },
                  },
                ]
              : undefined,
          },
        ],
      },
      ...this.paginationService.buildPaginationQuery(query),
    };
    const [data, totalCount] = await Promise.all([
      this.prismaService.addressHierarchy.findMany(dbQuery),
      this.prismaService.addressHierarchy.count(pick(dbQuery, 'where')),
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
