import { Injectable, NotFoundException } from '@nestjs/common';
import { pick } from 'lodash';
import { PaginationService } from 'src/common/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserSession } from '../auth/auth.types';
import { FunctionFirstArgument } from '../common/common.types';
import {
  FindScreeningsDto,
  ScreenClientDto,
  StringBoolean,
} from './screenings.dto';

@Injectable()
export class ScreeningsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(
    findScreeningsDto: FindScreeningsDto,
    originalUrl: string,
    user: UserSession['user'],
  ) {
    const chp = await this.prismaService.communityHealthProvider.findUnique({
      where: { userId: user.id },
    });
    if (!chp) {
      throw new NotFoundException('Community health provider not found');
    }
    const dbQuery: FunctionFirstArgument<
      typeof this.prismaService.screening.findMany
    > = {
      where: {
        clientId: findScreeningsDto.clientId,
        providerId:
          findScreeningsDto.includeForAllProviders === StringBoolean.TRUE
            ? undefined
            : (findScreeningsDto.providerId ?? chp.id),
      },
    };
    const [data, totalCount] = await Promise.all([
      this.prismaService.screening.findMany(dbQuery),
      this.prismaService.screening.count(pick(dbQuery, 'where')),
    ]);
    return {
      results: data,
      ...this.paginationService.buildPaginationControls(
        totalCount,
        originalUrl,
        findScreeningsDto,
      ),
    };
  }

  async create(screenClientDto: ScreenClientDto, user: UserSession['user']) {
    const chp = await this.prismaService.communityHealthProvider.findUnique({
      where: { userId: user.id },
    });
    if (!chp) {
      throw new NotFoundException('Community health provider not found');
    }
    return await this.prismaService.screening.create({
      data: {
        ...screenClientDto,
        providerId: chp.id,
        coordinates: {
          latitude: screenClientDto.coordinates.latitude,
          longitude: screenClientDto.coordinates.longitude,
        },
      },
    });
  }
}
