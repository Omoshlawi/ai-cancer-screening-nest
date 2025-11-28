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
import { CreateFaqDto, FindFaqDto, UpdateFaqDto } from './faq.dto';

@Injectable()
export class FaqService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  create(createFaqDto: CreateFaqDto) {
    return this.prismaService.frequentlyAskedQuestion.create({
      data: {
        question: createFaqDto.question,
        answer: createFaqDto.answer,
        topicId: createFaqDto.topicId ?? null,
      },
      include: {
        topic: true,
      },
    });
  }

  async findAll(findFaqDto: FindFaqDto, originalUrl: string) {
    const dbQuery: FunctionFirstArgument<
      typeof this.prismaService.frequentlyAskedQuestion.findMany
    > = {
      where: {
        AND: [
          {
            topicId: findFaqDto.topicId ?? undefined,
          },
          {
            OR: findFaqDto.search
              ? [
                  {
                    question: {
                      contains: findFaqDto.search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    answer: {
                      contains: findFaqDto.search,
                      mode: 'insensitive',
                    },
                  },
                ]
              : undefined,
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        topic: true,
      },
      ...this.paginationService.buildPaginationQuery(findFaqDto),
    };
    const [data, totalCount] = await Promise.all([
      this.prismaService.frequentlyAskedQuestion.findMany(dbQuery),
      this.prismaService.frequentlyAskedQuestion.count(pick(dbQuery, 'where')),
    ]);
    return {
      results: data,
      ...this.paginationService.buildPaginationControls(
        totalCount,
        originalUrl,
        findFaqDto,
      ),
    };
  }

  async findOne(id: string) {
    const faq = await this.prismaService.frequentlyAskedQuestion.findUnique({
      where: { id },
      include: {
        topic: true,
      },
    });
    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }
    return faq;
  }

  async update(id: string, updateFaqDto: UpdateFaqDto) {
    const faq = await this.findOne(id);
    return await this.prismaService.frequentlyAskedQuestion.update({
      where: { id: faq.id },
      data: updateFaqDto,
      include: {
        topic: true,
      },
    });
  }

  async delete(id: string) {
    const faq = await this.findOne(id);
    return await this.prismaService.frequentlyAskedQuestion.delete({
      where: { id: faq.id },
    });
  }
}
