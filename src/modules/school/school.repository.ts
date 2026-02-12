import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SchoolRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a school record.
   * Accepts an optional transaction client to ensure atomicity.
   */
  async createSchool(
    data: Prisma.SchoolUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;
    return client.school.create({ data });
  }

  async findById(id: number) {
    return this.prisma.school.findUnique({
      where: { id },
      include: { domains: true },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.school.findUnique({
      where: { slug: slug.toLowerCase() },
    });
  }
}
