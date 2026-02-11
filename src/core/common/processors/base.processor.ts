import { OnWorkerEvent, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

export abstract class BaseProcessor extends WorkerHost {
  protected readonly logger: Logger;

  constructor(processorName: string) {
    super();
    this.logger = new Logger(processorName);
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`🚀 Started job ${job.id} of type ${job.name}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`✅ Finished job ${job.id} of type ${job.name}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `❌ Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack,
    );
  }
}
