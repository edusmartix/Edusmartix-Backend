import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { DomainType } from '@prisma/client';
import { TenantRepository } from '../../tenant/tenant.repository';
import { SchoolRepository } from './school.repository';

@Injectable()
export class SchoolService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schoolRepo: SchoolRepository,
    private readonly tenantRepo: TenantRepository,
  ) {}

  async setupSchool(dto: CreateSchoolDto) {
    const base = `${dto.slug}${dto.suffix || '.edusmartix.com'}`;

    // 1. Pre-check if domain is taken before starting transaction
    const isTaken = await this.tenantRepo.exists(`portal.${base}`);
    if (isTaken) {
      throw new ConflictException('This school domain is already taken');
    }

    // 2. Start Transaction
    return this.prisma.$transaction(async (tx) => {
      // Create the school record
      const school = await this.schoolRepo.createSchool(
        {
          name: dto.name,
          slug: dto.slug.toLowerCase(),
          ownerUserId: dto.ownerUserId,
          address: dto.address,
          schoolType: dto.schoolType,
        },
        tx,
      );

      // Create the 3 domains using the new school.id
      await this.tenantRepo.createMultiple(
        school.id,
        [
          { domain: `portal.${base}`, type: DomainType.SCHOOL_PORTAL },
          { domain: `students.${base}`, type: DomainType.STUDENTS },
          { domain: `parents.${base}`, type: DomainType.PARENTS },
        ],
        tx,
      );

      return {
        success: true,
        schoolId: school.id,
        baseDomain: base,
      };
    });
  }
}
