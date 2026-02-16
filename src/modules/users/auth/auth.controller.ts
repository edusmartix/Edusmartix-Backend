import {
  Controller,
  // Get,
  Post,
  Body,
  // Patch,
  // Param,
  // Delete,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('send-otp')
  async sendOtp(@Body('userId', ParseIntPipe) userId: number) {
    return await this.authService.sendOtp(userId);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { userId: number; otp: string }) {
    return this.authService.verifyOtp(body.userId, body.otp);
  }

  @Post('login')
  async login(@Req() req, @Body() dto: LoginDto) {
    const schoolId = req['schoolId']; // From TenantMiddleware
    const domainType = req['domainType']; // From TenantMiddleware (SCHOOL_PORTAL, STUDENTS, etc.)

    // If no schoolId, they are at the main EduSmartix domain
    if (!schoolId) {
      return this.authService.loginGlobal(dto.email, dto.password);
    }

    // Otherwise, they are at a school-specific domain
    return this.authService.loginTenant(
      dto.email,
      dto.password,
      schoolId,
      domainType,
    );
  }
}
