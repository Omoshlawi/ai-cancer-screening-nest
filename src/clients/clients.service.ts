import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { pick } from 'lodash';
import { BetterAuthWithPlugins, UserSession } from '../auth/auth.types';
import { FunctionFirstArgument } from '../common/common.types';
import { PaginationService } from '../common/pagination.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, FindClientDto, UpdateClientDto } from './client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService<BetterAuthWithPlugins>,
    private readonly paginationService: PaginationService,
  ) {}

  async create(createClientDto: CreateClientDto, user: UserSession['user']) {
    return this.prismaService.client.create({
      data: {
        firstName: createClientDto.firstName,
        lastName: createClientDto.lastName,
        dateOfBirth: createClientDto.dateOfBirth,
        phoneNumber: createClientDto.phoneNumber,
        address: createClientDto.address,
        nationalId: createClientDto.nationalId,
        maritalStatus: createClientDto.maritalStatus,
        createdById: user.id,
      },
    });
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
        ],
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
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const client = await this.findOne(id);
    return await this.prismaService.client.update({
      where: { id: client.id },
      data: updateClientDto,
    });
  }

  async delete(id: string) {
    const client = await this.findOne(id);
    return await this.prismaService.client.delete({
      where: { id: client.id },
    });
  }
}
