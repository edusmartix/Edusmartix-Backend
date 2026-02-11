import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { SignupDto } from './dto/signup.dto';
import { UserRepository } from './user.repository';
import { CacheService } from '../../infrastructure/redis/cache.service';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly mailService: MailService,
    private readonly cacheService: CacheService,
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
      message: 'Account activated successfully. You can now log in.',
    };
  }
}
