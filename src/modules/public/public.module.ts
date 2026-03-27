import { Module } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './public.controller';

@Module({
  controllers: [NewsletterController],
  providers: [NewsletterService],
})
export class PublicModule {}
