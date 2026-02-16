import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MailService } from '../../../core/mail/mail.service';
import { SignupDto } from './dto/signup.dto';
import { UserRepository } from '../user.repository';
import { CacheService } from '../../../core/redis/cache.service';
import * as bcrypt from 'bcryptjs';
import { DomainType, UserRole } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly mailService: MailService,
    private readonly cacheService: CacheService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    // 1. Check for existing user
    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 3. Create user via Repository
    const user = await this.userRepo.createUser({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      otherName: dto.otherName,
      passwordHash,
      role: UserRole.SCHOOL_OWNER, // Using the Prisma Enum
      isActive: false,
    });

    // 4. Handle OTP logic
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Redis (10 minutes = 600 seconds)
    await this.cacheService.cacheData(`otp:${user.id}`, otp, 600);

    // 5. Send Background Email
    await this.mailService.sendOtpEmail(user.email, user, otp);

    return {
      message: 'Registration successful. Please check your email for the OTP.',
      userId: user.id,
    };
  }

  async sendOtp(userId: number) {
    // 1. Verify user exists
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Don't resend if already active
    if (user.isActive) {
      throw new BadRequestException('Account is already activated');
    }

    // 3. Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Overwrite existing OTP in Redis (resets the 10-minute timer)
    await this.cacheService.cacheData(`otp:${user.id}`, otp, 600);

    // 5. Send Email
    await this.mailService.sendOtpEmail(user.email, user, otp);

    return { message: 'A new OTP has been sent to your email.' };
  }

  async verifyOtp(userId: number, otp: string) {
    // 1. Get OTP from Redis
    const cachedOtp = await this.cacheService.getCachedData(`otp:${userId}`);

    // 2. Compare values
    if (!cachedOtp || cachedOtp !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // 3. Activate User in DB via Repository
    await this.userRepo.updateStatus(userId, true);

    // 4. Cleanup Redis (Prevent replay attacks)
    await this.cacheService.invalidateData(`otp:${userId}`);

    return {
      message: 'Account activated successfully.',
    };
  }

  /**
   * 1. GLOBAL LOGIN (For School Owners)
   * Domain: edusmartix.com / app.edusmartix.com
   */
  async loginGlobal(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash || user.role !== 'SCHOOL_OWNER') {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // Issue a "Global" token (no schoolId)
    const payload = { sub: user.id, role: user.role, type: 'GLOBAL' };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, firstName: user.firstName },
    };
  }

  /**
   * 2. TENANT LOGIN (Staff, Parents, Students)
   * Domain: schoolname.edusmartix.com or custom domains
   */
  async loginTenant(
    email: string,
    pass: string,
    schoolId: number,
    domainType: DomainType,
  ) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Account not found.');

    let profile: any = null;
    let loginRole: string = '';

    // Use switch case for cleaner logic based on the domain being accessed
    switch (domainType) {
      case 'STUDENTS':
        profile = await this.prisma.student.findUnique({
          where: { userId_schoolId: { userId: user.id, schoolId } },
        });
        loginRole = 'STUDENT';
        break;

      case 'PARENTS':
        profile = await this.prisma.parentProfile.findUnique({
          where: { userId_schoolId: { userId: user.id, schoolId } },
        });
        loginRole = 'PARENT';
        break;

      case 'SCHOOL_PORTAL':
      default:
        profile = await this.prisma.staffProfile.findUnique({
          where: { userId_schoolId: { userId: user.id, schoolId } },
        });
        // For staff, we use the specific role from their profile (ADMIN, ACCOUNTANT, etc.)
        loginRole = profile?.role;
        break;
    }

    // Robust validation check
    if (!profile || !profile.passwordHash) {
      throw new UnauthorizedException(
        'No active account found for this school portal.',
      );
    }

    // Profile-level isActive check
    // Note: Student model doesn't have isActive in your current schema,
    // so we fallback to 'true' if the field doesn't exist.
    const isProfileActive = profile.isActive ?? true;
    if (!isProfileActive) {
      throw new UnauthorizedException(
        'Your access to this school has been deactivated.',
      );
    }

    const isMatch = await bcrypt.compare(pass, profile.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials.');

    // Issue the token...
    const payload = {
      sub: user.id,
      schoolId,
      role: user.role,
      domainType: domainType,
      profileRole: loginRole,
      type: 'TENANT',
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        role: loginRole,
      },
    };
  }
}
