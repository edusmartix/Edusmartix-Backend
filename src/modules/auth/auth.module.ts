import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailModule } from '../mail/mail.module';
import { UserRepository } from './user.repository';
import { CacheService } from 'src/infrastructure/redis/cache.service';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Global() // Makes JwtService available application-wide
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    MailModule,
  ],
  providers: [AuthService, UserRepository, CacheService, PrismaService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
