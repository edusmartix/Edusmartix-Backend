import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [PrismaModule, AuthModule, MailModule, RedisModule, CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
