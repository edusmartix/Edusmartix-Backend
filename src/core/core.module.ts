import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { RedisModule } from './redis/redis.module';
import { MailModule } from './mail/mail.module';

@Global() // This makes Prisma, Cache, etc., available without re-importing
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, expandVariables: true }),
    RedisModule,
    MailModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService, RedisModule, MailModule, ConfigModule],
})
export class CoreModule {}
