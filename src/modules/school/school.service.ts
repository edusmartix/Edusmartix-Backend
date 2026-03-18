import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { DomainType, StaffRole } from '@prisma/client';
import { TenantRepository } from '../../tenant/tenant.repository';
import { SchoolRepository } from './school.repository';
import { UserRepository } from '../users/user.repository';

@Injectable()
export class SchoolService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schoolRepo: SchoolRepository,
    private readonly tenantRepo: TenantRepository,
    private readonly userRepo: UserRepository,
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
      // 1. Create the school record
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

      // 2. Fetch the Owner's global details to sync with their new profile
      const owner = await tx.user.findUnique({
        where: { id: dto.ownerUserId },
      });

      if (!owner) {
        throw new ConflictException('Owner user not found');
      }

      // 3. Create the StaffProfile for the Owner (Automatic ADMIN)
      // We use the owner's global password hash so they have "Single Sign-On"
      await this.userRepo.createStaffProfile(
        {
          userId: owner.id,
          schoolId: school.id,
          firstName: owner.firstName,
          lastName: owner.lastName,
          passwordHash: owner.passwordHash, // Uses their global password
          role: StaffRole.ADMIN,
          isActive: true,
        },
        tx,
      );

      // 4. Create the 3 domains
      await this.tenantRepo.createMultiple(
        school.id,
        [
          { domain: base, type: DomainType.SCHOOL_PORTAL },
          { domain: `portal.${base}`, type: DomainType.SCHOOL_PORTAL },
          { domain: `students.${base}`, type: DomainType.STUDENTS },
          { domain: `parents.${base}`, type: DomainType.PARENTS },
        ],
        tx,
      );
      return {
        success: true,
        schoolId: school.id,
        baseDomain: `portal.${base}`,
      };
    });
  }
}
