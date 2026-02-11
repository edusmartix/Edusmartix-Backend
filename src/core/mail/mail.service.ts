import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(@InjectQueue('email-queue') private readonly emailQueue: Queue) {}

  async sendOtpEmail(email: string, user: any, otp: string) {
    await this.emailQueue.add(
      'send-otp-email',
      {
        email,
        user,
        extraData: { otp },
        template: 'otp-template',
        subject: 'Your EduSmartix OTP',
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
      },
    );
  }
}
