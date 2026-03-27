import { Module } from '@nestjs/common';
import { PublicService } from './newsletter.service';
import { PublicController } from './public.controller';

@Module({
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
