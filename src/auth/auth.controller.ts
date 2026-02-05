import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { PrismaService } from '../prisma/prisma.service';
import type { BetterAuthWithPlugins } from './auth.types';
import { RequireSystemPermission } from './auth.decorators';
import { PaginationDto } from '../common/commond.dto';

@Controller('/extended/auth')
export class AuthExtendedController {
  constructor(
    private readonly authService: AuthService<BetterAuthWithPlugins>,
    private readonly prismaService: PrismaService,
  ) { }

  @Get('sessions/:userId')
  @RequireSystemPermission({
    chp: ['list'],
  })
  async getUserSessions(
    @Param('userId') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.prismaService.session.findMany({
      where: {
        userId,
      },
      orderBy: paginationDto.sortBy
        ? { [paginationDto.sortBy]: paginationDto.sortOrder || 'desc' }
        : { createdAt: 'desc' },
    });
  }
}
