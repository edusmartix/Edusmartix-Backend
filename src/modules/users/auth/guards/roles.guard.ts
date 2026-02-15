import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request['user']; // Populated by your AuthGuard
    const schoolIdFromHeader = request['schoolId']; // Populated by your TenantMiddleware

    if (!user) throw new ForbiddenException('User context not found');
    if (!schoolIdFromHeader)
      throw new ForbiddenException('School context missing');

    // 2. Basic Role Check
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) throw new ForbiddenException('Insufficient permissions');

    // 3. Multi-Tenant Ownership/Membership Check
    if (user.role === UserRole.SCHOOL_OWNER) {
      const school = await this.prisma.school.findFirst({
        where: { id: Number(schoolIdFromHeader), ownerUserId: user.id },
      });
      if (!school) throw new ForbiddenException('You do not own this school');
    }

    if (user.role === UserRole.STAFF) {
      const staff = await this.prisma.staffProfile.findUnique({
        where: {
          userId_schoolId: {
            userId: user.id,
            schoolId: Number(schoolIdFromHeader),
          },
        },
      });
      if (!staff || !staff.isActive) {
        throw new ForbiddenException(
          'You are not an active staff in this school',
        );
      }
    }

    return true;
  }
}
