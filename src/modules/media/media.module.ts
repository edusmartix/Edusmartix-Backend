import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MediaController } from './media.controller';
import { R2Service } from '../../core/r2/r2.provider';
import { MediaCleanupService } from './media-cleanup.service';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Enables Cron jobs
  ],
  controllers: [MediaController],
  providers: [R2Service, MediaCleanupService],
  exports: [R2Service],
})
export class MediaModule {}
