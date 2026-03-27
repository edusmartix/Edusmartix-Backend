import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(private prisma: PrismaService) {}

  async subscribe(dto: SubscribeNewsletterDto) {
    // We check if they already subscribed in the last 24 hours
    // to prevent accidental double-clicks/spam
    const recentSub = await this.prisma.newsletterSubscription.findFirst({
      where: {
        email: dto.email,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        },
      },
    });

    if (recentSub) {
      // We return the existing sub gracefully instead of throwing an error
      return {
        message: 'You are already on the list! We will reach out soon.',
        alreadySubscribed: true,
      };
    }

    // Otherwise, create a new record
    const newSub = await this.prisma.newsletterSubscription.create({
      data: dto,
    });

    return {
      message: 'Thank you for subscribing!',
      id: newSub.id,
    };
  }
}
