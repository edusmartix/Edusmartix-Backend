import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BaseProcessor } from '../common/processors/base.processor';
import { MailProviderService } from './mail-provider.service';

@Processor('email-queue')
export class MailProcessor extends BaseProcessor {
  constructor(private readonly mailProvider: MailProviderService) {
    super(MailProcessor.name);
  }

  async process(job: Job<any>): Promise<void> {
    // Simply delegate to the provider
    await this.mailProvider.sendEmail({
      to: job.data.email,
      template: job.data.template,
      subject: job.data.subject,
      user: job.data.user,
      extraData: job.data.extraData,
    });
  }
}
