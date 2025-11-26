import { PrismaService } from '../prisma/prisma.service';

export class ScoringService {
  constructor(private readonly prismaService: PrismaService) {}
}
