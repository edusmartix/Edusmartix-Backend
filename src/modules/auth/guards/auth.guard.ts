import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { CacheService } from '../../../infrastructure/redis/cache.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1) Get token from Header or Cookies
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('You are not logged in!');
    }

    try {
      // 2) Verify token
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // 3) CHECK REDIS CACHE FIRST 🚀
      let currentUser = await this.cache.getCachedUser(decoded.sub);

      if (currentUser) {
        // Handle Date conversion if JSON.parse lost the type
        if (typeof currentUser.tokenIssuedAt === 'string') {
          currentUser.tokenIssuedAt = new Date(currentUser.tokenIssuedAt);
        }
      } else {
        // 4) CACHE MISS -> Fetch from Database
        currentUser = await this.prisma.user.findUnique({
          where: { id: decoded.sub },
          select: {
            id: true,
            email: true,
            isActive: true,
            isVerified: true,
            tokenIssuedAt: true,
            role: true,
          },
        });

        if (currentUser) {
          // Store in Redis via our helper
          await this.cache.cacheUser(decoded.sub, currentUser);
        }
      }

      if (!currentUser) {
        throw new UnauthorizedException('The user no longer exists.');
      }

      // 5) Check for Deactivation
      if (!currentUser.isActive) {
        throw new UnauthorizedException('Your account has been deactivated.');
      }

      // 6) Check for Token Revocation (Issued At check)
      const tokenRevocationTime = Math.floor(
        new Date(currentUser.tokenIssuedAt).getTime() / 1000,
      );
      if (decoded.iat && decoded.iat < tokenRevocationTime) {
        throw new UnauthorizedException(
          'Session invalidated. Please log in again.',
        );
      }

      // 7) GRANT ACCESS
      request['user'] = {
        ...currentUser,
        iat: decoded.iat,
        exp: decoded.exp,
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException(err.message || 'Authentication failed');
    }
  }

  private extractToken(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer') return token;
    return request.cookies?.accessToken;
  }
}
