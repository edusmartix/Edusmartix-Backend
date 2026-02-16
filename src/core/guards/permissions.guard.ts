import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StaffRole, UserRole } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Get roles from BOTH decorators if they exist
    const roles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    const staffRoles = this.reflector.getAllAndOverride<StaffRole[]>(
      'staffRoles',
      [context.getHandler(), context.getClass()],
    );

    // If no protection is set, allow access
    if (!roles && !staffRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Already populated by AuthGuard

    if (!user) return false;

    // 2. MASTER ACCESS: School Owners bypass everything
    if (user.globalRole === 'SCHOOL_OWNER') return true;

    // 3. CHECK GLOBAL ROLES (UserRole)
    if (roles && roles.includes(user.globalRole)) return true;

    // 4. CHECK STAFF ROLES (StaffRole)
    // We use 'staffRole' which we added to the request object in AuthGuard!
    if (staffRoles && staffRoles.includes(user.staffRole)) return true;

    throw new ForbiddenException('You do not have the required permissions');
  }
}
