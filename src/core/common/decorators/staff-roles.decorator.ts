import { SetMetadata } from '@nestjs/common';
import { StaffRole } from '@prisma/client';

export const StaffRoles = (...roles: StaffRole[]) =>
  SetMetadata('staffRoles', roles);
