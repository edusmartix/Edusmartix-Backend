import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { CacheService } from '../core/redis/cache.service';

@Injectable()
export class TenantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async getTenantByDomain(domain: string) {
    const cacheKey = `tenant:${domain}`;

    // Check cache first
    const cached = await this.cache.getCachedData<any>(cacheKey);
    if (cached) return cached;

    // Query DB with Branding
    const record = await this.prisma.schoolDomain.findUnique({
      where: { domain },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            primaryColor: true,
          },
        },
      },
    });

    if (!record) throw new NotFoundException('Domain not registered');

    const tenantData = {
      schoolId: record.schoolId,
      portalType: record.type,
      branding: record.school,
    };

    // Cache for 1 hour
    await this.cache.cacheData(cacheKey, tenantData, 3600);
    return tenantData;
  }

  async isDomainAvailable(domain: string): Promise<boolean> {
    const count = await this.prisma.schoolDomain.count({
      where: { domain: domain.toLowerCase().trim() },
    });
    return count === 0;
  }
}
