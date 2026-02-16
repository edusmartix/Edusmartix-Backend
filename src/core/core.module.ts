import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { RedisModule } from './redis/redis.module';
import { MailModule } from './mail/mail.module';
import { CacheService } from './redis/cache.service';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Global() // This makes Prisma, Cache, etc., available without re-importing
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, expandVariables: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    RedisModule,
    MailModule,
  ],
  providers: [PrismaService, CacheService, AuthGuard, RolesGuard],
  exports: [PrismaService, CacheService, JwtModule, AuthGuard, RolesGuard],
})
export class CoreModule {}
