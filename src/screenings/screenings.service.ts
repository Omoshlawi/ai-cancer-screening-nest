/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { ScoringService } from './scoring.sevice';

@Injectable()
export class ScreeningsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly scoringService: ScoringService,
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
      include: {
        client: true,
        provider: true,
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
    const scoringResult = await this.scoringService.scoreClient(
      screenClientDto.clientId,
      screenClientDto,
    );
    return await this.prismaService.screening.create({
      data: {
        ...screenClientDto,
        providerId: chp.id,
        coordinates: {
          latitude: screenClientDto.coordinates.latitude,
          longitude: screenClientDto.coordinates.longitude,
        },
        scoringResult: scoringResult as any,
      },
      include: {
        client: true,
        provider: true,
      },
    });
  }

  async findOne(id: string) {
    const screening = await this.prismaService.screening.findUnique({
      where: { id },
      include: {
        client: true,
        provider: true,
      },
    });
    if (!screening) {
      throw new NotFoundException('Screening not found');
    }
    return screening;
  }
}
