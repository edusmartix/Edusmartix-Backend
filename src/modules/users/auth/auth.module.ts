import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailModule } from '../../../core/mail/mail.module';
import { CacheService } from 'src/core/redis/cache.service';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { UsersModule } from '../users.module';

@Global() // Makes JwtService available application-wide
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    MailModule,
    UsersModule,
  ],
  providers: [AuthService, CacheService, PrismaService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
