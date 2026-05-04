import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import { Request } from 'express';
import { BetterAuthWithPlugins } from '../auth/auth.types';
import { REQUIRE_CHP_TOKEN } from './chp.constants';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RequireCHPGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService<BetterAuthWithPlugins>,
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check for decorator on handler (method) first, then on class
    const requireChp =
      this.reflector.get<boolean | undefined>(
        REQUIRE_CHP_TOKEN,
        context.getHandler(),
      ) ??
      this.reflector.get<boolean | undefined>(
        REQUIRE_CHP_TOKEN,
        context.getClass(),
      );

    // If decorator is not present, allow the request to pass through
    if (!requireChp) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const session = await this.authService.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    if (!session || !session.session || !session.user)
      throw new UnauthorizedException();

    const chp = await this.prismaService.communityHealthProvider.findUnique({
      where: { userId: session.user.id },
    });

    const userRole = Array.isArray(session.user.role) ? session.user.role[0] : session.user.role;
    if (userRole?.toLowerCase() === 'admin') {
      return true;
    }

    // Fallback: Check if they have the system permission to create clients anyway
    const { success } = await this.authService.api.userHasPermission({
      headers: fromNodeHeaders(request.headers),
      body: {
        permissions: { clients: ['create'] },
      },
    });
    if (success) {
      return true;
    }

    if (!chp) {
      throw new ForbiddenException('Community health provider not found');
    }
    if (requireChp && !chp.id) {
      throw new ForbiddenException('Community health provider not found');
    }
    return true;
  }
}
