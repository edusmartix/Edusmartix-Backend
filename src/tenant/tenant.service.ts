import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { CacheService } from '../core/redis/cache.service';
import { TenantRepository } from './tenant.repository';

@Injectable()
export class TenantService {
  constructor(
    private readonly repo: TenantRepository,
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

  async checkSlugAvailability(
    slug: string,
    baseSuffix: string = '.edusmartix.com',
  ) {
    const sanitizedSlug = slug.toLowerCase().trim();

    // We check the primary one: portal.slug.edusmartix.com
    const fullDomain = `portal.${sanitizedSlug}${baseSuffix}`;
    const taken = await this.repo.exists(fullDomain);

    return {
      available: !taken,
      suggestedSlug: sanitizedSlug,
    };
  }
}
