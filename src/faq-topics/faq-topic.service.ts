/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { pick } from 'lodash';
import { FunctionFirstArgument } from '../common/common.types';
import { PaginationService } from '../common/pagination.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFaqTopicDto,
  FindFaqTopicDto,
  UpdateFaqTopicDto,
} from './faq-topic.dto';

@Injectable()
export class FaqTopicService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  create(createFaqTopicDto: CreateFaqTopicDto) {
    return this.prismaService.faqTopic.create({
      data: {
        name: createFaqTopicDto.name,
      },
      include: {
        faqs: true,
      },
    });
  }

  async findAll(findFaqTopicDto: FindFaqTopicDto, originalUrl: string) {
    const dbQuery: FunctionFirstArgument<
      typeof this.prismaService.faqTopic.findMany
    > = {
      where: {
        OR: findFaqTopicDto.search
          ? [
              {
                name: {
                  contains: findFaqTopicDto.search,
                  mode: 'insensitive',
                },
              },
            ]
          : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        faqs: true,
      },
      ...this.paginationService.buildPaginationQuery(findFaqTopicDto),
    };
    const [data, totalCount] = await Promise.all([
      this.prismaService.faqTopic.findMany(dbQuery),
      this.prismaService.faqTopic.count(pick(dbQuery, 'where')),
    ]);
    return {
      results: data,
      ...this.paginationService.buildPaginationControls(
        totalCount,
        originalUrl,
        findFaqTopicDto,
      ),
    };
  }

  async findOne(id: string) {
    const faqTopic = await this.prismaService.faqTopic.findUnique({
      where: { id },
      include: {
        faqs: true,
      },
    });
    if (!faqTopic) {
      throw new NotFoundException('FAQ topic not found');
    }
    return faqTopic;
  }

  async update(id: string, updateFaqTopicDto: UpdateFaqTopicDto) {
    const faqTopic = await this.findOne(id);
    return await this.prismaService.faqTopic.update({
      where: { id: faqTopic.id },
      data: updateFaqTopicDto,
      include: {
        faqs: true,
      },
    });
  }

  async delete(id: string) {
    const faqTopic = await this.findOne(id);
    return await this.prismaService.faqTopic.delete({
      where: { id: faqTopic.id },
    });
  }
}
