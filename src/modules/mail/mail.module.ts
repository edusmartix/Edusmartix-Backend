import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';
import { BullModule } from '@nestjs/bullmq';
import { MailProviderService } from './mail-provider.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'email-queue' })],
  providers: [
    MailService, // The Producer (puts in queue)
    MailProcessor, // The Worker (consumes queue)
    MailProviderService, // The actual Brevo Logic
  ],
  exports: [MailService, MailProviderService],
})
export class MailModule {}
