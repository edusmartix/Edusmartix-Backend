import { Controller, Post, Body } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Controller('public/newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  async subscribe(@Body() dto: SubscribeNewsletterDto) {
    await this.newsletterService.subscribe(dto);
    return { message: 'Thank you for subscribing! We will be in touch.' };
  }
}
