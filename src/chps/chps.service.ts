/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '..//prisma/prisma.service';
import { CreateChpDto, FindChpDto } from './chp.dto';
import { AuthService } from '@thallesp/nestjs-better-auth';
import type { BetterAuthWithPlugins } from '../auth/auth.types';
import { PaginationService } from '../common/pagination.service';
import { FunctionFirstArgument } from 'src/common/common.types';
import { pick } from 'lodash';

@Injectable()
export class ChpsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService<BetterAuthWithPlugins>,
    private readonly paginationService: PaginationService,
  ) {}

  async create(createChpDto: CreateChpDto) {
    const user = await this.authService.api.createUser({
      body: {
        email: createChpDto.email,
        password: createChpDto.password,
        name: createChpDto.firstName + ' ' + createChpDto.lastName,
        role: 'user', // TODO: change to chp
        ...{ username: createChpDto.username },
      },
    });
    return await this.prismaService.communityHealthProvider.create({
      data: {
        firstName: createChpDto.firstName,
        lastName: createChpDto.lastName,
        phoneNumber: createChpDto.phoneNumber,
        userId: user.user.id,
      },
      include: {
        user: true,
      },
    });
  }

  async findAll(findChpDto: FindChpDto, originalUrl: string) {
    const dbQuery: FunctionFirstArgument<
      typeof this.prismaService.communityHealthProvider.findMany
    > = {
      where: {
        AND: [
          {
            phoneNumber: findChpDto.phoneNumber ?? undefined,
            user: {
              email: findChpDto.email ?? undefined,
            },
          },
          {
            OR: findChpDto.name
              ? [
                  {
                    firstName: {
                      contains: findChpDto.name,
                      mode: 'insensitive',
                    },
                  },
                  {
                    lastName: {
                      contains: findChpDto.name,
                      mode: 'insensitive',
                    },
                  },
                ]
              : undefined,
          },
        ],
      },
      ...this.paginationService.buildPaginationQuery(findChpDto),
    };
    const [data, totalCount] = await Promise.all([
      this.prismaService.communityHealthProvider.findMany(dbQuery),
      this.prismaService.communityHealthProvider.count(pick(dbQuery, 'where')),
    ]);
    return {
      result: data,
      ...this.paginationService.buildPaginationControls(
        totalCount,
        originalUrl,
        pick(dbQuery, 'where'),
      ),
    };
  }
}
