import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StaffRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaffRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredStaffRoles = this.reflector.get<StaffRole[]>(
      'staffRoles',
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const schoolId = request['schoolId'];

    // 1. If the user is the SCHOOL_OWNER, they bypass all staff restrictions
    if (user.role === 'SCHOOL_OWNER') return true;

    // 2. If it's a STAFF member, check their specific StaffRole in this school
    const profile = await this.prisma.staffProfile.findUnique({
      where: {
        userId_schoolId: { userId: user.id, schoolId: Number(schoolId) },
      },
    });

    if (!profile || !profile.isActive) return false;

    // 3. Check if their StaffRole (ADMIN, TEACHER, etc.) is allowed
    return requiredStaffRoles.includes(profile.role);
  }
}
