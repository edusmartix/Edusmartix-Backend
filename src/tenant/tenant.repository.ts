import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { DomainType } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByDomain(domain: string) {
    return this.prisma.schoolDomain.findUnique({
      where: { domain: domain.toLowerCase() },
      include: {
        school: true,
      },
    });
  }

  async exists(domain: string): Promise<boolean> {
    const count = await this.prisma.schoolDomain.count({
      where: { domain: domain.toLowerCase() },
    });
    return count > 0;
  }

  async createMultiple(
    schoolId: number,
    domains: { domain: string; type: DomainType }[],
    tx?: Prisma.TransactionClient,
  ) {
    // If tx is provided, use it. Otherwise, use the standard this.prisma
    const client = tx || this.prisma;

    return client.schoolDomain.createMany({
      data: domains.map((d) => ({
        schoolId,
        domain: d.domain.toLowerCase(),
        type: d.type,
        isVerified: true, // Internal domains are pre-verified
        isPrimary: d.type === DomainType.SCHOOL_PORTAL,
      })),
    });
  }
}
