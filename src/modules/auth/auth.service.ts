import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async signup(dto: SignupDto) {
    // 1. Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 3. Create User (Default to SCHOOL_OWNER)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: UserRole.SCHOOL_OWNER,
        isActive: false, // Inactive until OTP verified
      },
    });

    // 4. Generate OTP (simple 6-digit for now)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 5. Send Background Email via BullMQ
    // We pass the OTP in extraData so the processor can inject it into the Pug template
    await this.mailService.sendOtpEmail(user.email, user, otp);

    return {
      message: 'User registered. Please check your email for the OTP.',
      userId: user.id,
    };
  }
  // create(createAuthDto: CreateAuthDto) {
  //   return 'This action adds a new auth';
  // }

  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
