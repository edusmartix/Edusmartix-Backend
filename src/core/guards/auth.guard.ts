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
    const currentSchoolId = request['schoolId'];
    const domainType = request['domainType'];

    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('You are not logged in!');

    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // 1) TENANT LOCK
      if (currentSchoolId && decoded.schoolId !== Number(currentSchoolId)) {
        throw new UnauthorizedException('Invalid session for this school.');
      }

      // 2) DOMAIN LOCK: Ensure the token type matches the domain type
      // Prevents a student token from being used on the staff portal
      if (currentSchoolId && decoded.domainType !== domainType) {
        throw new UnauthorizedException(
          'Incorrect portal for this account type.',
        );
      }

      // 3) CACHE CHECK (Keys are now tenant + domain specific)
      const cacheKey = `user:${decoded.sub}:school:${decoded.schoolId || 'global'}:type:${domainType || 'global'}`;
      let sessionUser = await this.cache.getCachedUser(cacheKey);

      if (!sessionUser) {
        // 4) DB FETCH
        sessionUser = await this.fetchUserWithProfile(
          decoded.sub,
          decoded.schoolId,
          domainType, // Pass domainType to be specific
        );

        if (sessionUser) {
          await this.cache.cacheUser(cacheKey, sessionUser);
        }
      }

      if (!sessionUser)
        throw new UnauthorizedException('Access denied for this portal.');

      // Profile-level isActive check
      if (sessionUser.isActive === false) {
        throw new UnauthorizedException('Your access has been deactivated.');
      }

      // 5) ATTACH TO REQUEST
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

  private async fetchUserWithProfile(
    userId: number,
    schoolId: number,
    domainType: string,
  ) {
    if (!schoolId) {
      return await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, isActive: true, role: true },
      });
    }

    // Explicitly fetch only what is needed based on the domainType
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        staffProfiles:
          domainType === 'SCHOOL_PORTAL' ? { where: { schoolId } } : false,
        parentProfiles:
          domainType === 'PARENTS' ? { where: { schoolId } } : false,
        studentProfile:
          domainType === 'STUDENTS' ? { where: { schoolId } } : false,
      },
    });

    if (!user) return null;

    // 3. Resolve Profile using Switch Statement
    let profile: any = null;

    // Pick the specific profile
    switch (domainType) {
      case 'SCHOOL_PORTAL':
        profile = user.staffProfiles?.[0];
        break;
      case 'PARENTS':
        profile = user.parentProfiles?.[0];
        break;
      case 'STUDENTS':
        profile = user.studentProfile;
        break;
      default:
        return null;
    }
    if (!profile) return null;

    return {
      id: user.id,
      email: user.email,
      globalRole: user.role,
      isActive: profile.isActive ?? true,
      firstName: profile.firstName,
      lastName: profile.lastName,
      schoolId: schoolId,
      profileId: profile.id,
      profileType: domainType,
      staffRole: domainType === 'SCHOOL_PORTAL' ? profile.role : null,
    };
  }

  private extractToken(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : request.cookies?.accessToken;
  }
}
