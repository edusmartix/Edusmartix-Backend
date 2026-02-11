import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ProfilesModule } from './profiles/profiles.module';
import { AuthModule } from './auth/auth.module';
import { UserRepository } from './user.repository';
import { CacheService } from 'src/core/redis/cache.service';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    AuthModule,
    UserRepository,
    ProfilesModule,
    CacheService,
    PrismaService,
  ],
})
export class UsersModule {}
