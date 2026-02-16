import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../redis/cache.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const currentSchoolId = request['schoolId']; // From your TenantMiddleware

    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('You are not logged in!');

    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // 1) TENANT LOCK: Is this token for the school being accessed?
      // School Owners logging into the main dashboard (no schoolId) might skip this
      if (currentSchoolId && decoded.schoolId !== Number(currentSchoolId)) {
        throw new UnauthorizedException('Invalid session for this school.');
      }

      // 2) CACHE CHECK (Tenant-Specific Key)
      const cacheKey = `user:${decoded.sub}:school:${decoded.schoolId || 'global'}`;
      let sessionUser = await this.cache.getCachedUser(cacheKey);

      if (!sessionUser) {
        // 3) DB FETCH: Get the User AND their specific Profile for this school
        // We use a raw query or findFirst to check across profile types
        sessionUser = await this.fetchUserWithProfile(
          decoded.sub,
          decoded.schoolId,
        );

        if (sessionUser) {
          await this.cache.cacheUser(cacheKey, sessionUser);
        }
      }

      if (!sessionUser)
        throw new UnauthorizedException('Account not found in this school.');
      if (!sessionUser.isActive)
        throw new UnauthorizedException(
          'Your access to this school has been deactivated.',
        );

      // 4) ATTACH TO REQUEST
      request['user'] = {
        ...sessionUser,
        iat: decoded.iat,
        exp: decoded.exp,
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException(err.message || 'Authentication failed');
    }
  }

  private async fetchUserWithProfile(userId: number, schoolId: number) {
    // If it's a school owner in global mode (no schoolId in token)
    if (!schoolId) {
      return await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, isActive: true, role: true },
      });
    }

    // Otherwise, fetch the user with their school-specific profile overrides
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        staffProfiles: { where: { schoolId: Number(schoolId) } },
        parentProfiles: { where: { schoolId: Number(schoolId) } },
        studentProfile: { where: { schoolId: Number(schoolId) } },
      },
    });

    if (!user) return null;

    // Resolve which profile they are using in this school
    const staff = user.staffProfiles[0];
    const parent = user.parentProfiles[0];
    const student = user.studentProfile;

    const activeProfile = staff || parent || student;
    if (!activeProfile) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role, // Global Role (SCHOOL_OWNER, STAFF, etc.)
      isActive: activeProfile.isActive ?? true, // Profile-level active status
      firstName: activeProfile.firstName, // Profile Override Name!
      lastName: activeProfile.lastName, // Profile Override Name!
      schoolId: schoolId,
      profileId: activeProfile.id,
      // If it's staff, we might want their StaffRole (ADMIN, TEACHER)
      staffRole: staff ? staff.role : null,
    };
  }

  private extractToken(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : request.cookies?.accessToken;
  }
}

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(
//     private jwtService: JwtService,
//     private prisma: PrismaService,
//     private cache: CacheService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();

//     // 1) Get token from Header or Cookies
//     const token = this.extractToken(request);
//     if (!token) {
//       throw new UnauthorizedException('You are not logged in!');
//     }

//     try {
//       // 2) Verify token
//       const decoded = await this.jwtService.verifyAsync(token, {
//         secret: process.env.JWT_SECRET,
//       });

//       // 3) CHECK REDIS CACHE FIRST 🚀
//       let currentUser = await this.cache.getCachedUser(decoded.sub);

//       if (currentUser) {
//         // Handle Date conversion if JSON.parse lost the type
//         if (typeof currentUser.tokenIssuedAt === 'string') {
//           currentUser.tokenIssuedAt = new Date(currentUser.tokenIssuedAt);
//         }
//       } else {
//         // 4) CACHE MISS -> Fetch from Database
//         currentUser = await this.prisma.user.findUnique({
//           where: { id: decoded.sub },
//           select: {
//             id: true,
//             email: true,
//             isActive: true,
//             role: true,
//           },
//         });

//         if (currentUser) {
//           // Store in Redis via our helper
//           await this.cache.cacheUser(decoded.sub, currentUser);
//         }
//       }

//       if (!currentUser) {
//         throw new UnauthorizedException('The user no longer exists.');
//       }

//       // 5) Check for Deactivation
//       if (!currentUser.isActive) {
//         throw new UnauthorizedException('Your account has been deactivated.');
//       }

//       // 6) Check for Token Revocation (Issued At check)
//       // const tokenRevocationTime = Math.floor(
//       //   new Date(currentUser.tokenIssuedAt).getTime() / 1000,
//       // );
//       // if (decoded.iat && decoded.iat < tokenRevocationTime) {
//       //   throw new UnauthorizedException(
//       //     'Session invalidated. Please log in again.',
//       //   );
//       // }

//       // 7) GRANT ACCESS
//       request['user'] = {
//         ...currentUser,
//         iat: decoded.iat,
//         exp: decoded.exp,
//       };

//       return true;
//     } catch (err) {
//       throw new UnauthorizedException(err.message || 'Authentication failed');
//     }
//   }

//   private extractToken(request: any): string | undefined {
//     const [type, token] = request.headers.authorization?.split(' ') ?? [];
//     if (type === 'Bearer') return token;
//     return request.cookies?.accessToken;
//   }
// }
