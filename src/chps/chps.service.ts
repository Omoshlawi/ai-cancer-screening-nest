import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '..//prisma/prisma.service';
import { CreateChpDto, FindChpDto } from './chp.dto';
import { AuthService } from '@thallesp/nestjs-better-auth';
import type { BetterAuthWithPlugins } from '../auth/auth.types';
import { PaginationService } from '../common/pagination.service';
import { FunctionFirstArgument } from '../common/common.types';
import { pick } from 'lodash';

@Injectable()
export class ChpsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService<BetterAuthWithPlugins>,
    private readonly paginationService: PaginationService,
  ) { }

  async create(createChpDto: CreateChpDto) {
    const isUsernameAvailable = await this.authService.api.isUsernameAvailable({
      body: { username: createChpDto.username },
    });
    if (!isUsernameAvailable) {
      throw new BadRequestException('Username is already taken');
    }
    const user = await this.authService.api.createUser({
      body: {
        email: createChpDto.email,
        password: createChpDto.password,
        name: createChpDto.firstName + ' ' + createChpDto.lastName,
        role: 'chp',
      },
    });

    await this.prismaService.user.update({
      where: { id: user.user.id },
      data: {
        username: createChpDto.username,
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
      orderBy: findChpDto.sortBy
        ? { [findChpDto.sortBy]: this.paginationService.getSortOrder(findChpDto.sortOrder) }
        : { createdAt: 'desc' },
      ...this.paginationService.buildPaginationQuery(findChpDto),
    };
    const [data, totalCount] = await Promise.all([
      this.prismaService.communityHealthProvider.findMany({
        ...dbQuery,
        include: {
          user: true,
          _count: {
            select: {
              clients: true,
              screenings: true,
            },
          },
        },
      }),
      this.prismaService.communityHealthProvider.count(pick(dbQuery, 'where')),
    ]);

    return {
      results: data,
      ...this.paginationService.buildPaginationControls(
        totalCount,
        originalUrl,
        findChpDto,
      ),
    };
  }

  async findOne(id: string) {
    const chp = await this.prismaService.communityHealthProvider.findUnique({
      where: { id },
    });
    if (!chp) {
      throw new NotFoundException('Community health provider not found');
    }
    return chp;
  }
}
