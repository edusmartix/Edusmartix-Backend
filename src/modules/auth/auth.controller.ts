import {
  Controller,
  // Get,
  Post,
  Body,
  // Patch,
  // Param,
  // Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';

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
}
