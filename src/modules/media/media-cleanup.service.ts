import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../core/prisma/prisma.service';
import { R2Service } from '../../core/r2/r2.provider';

@Injectable()
export class MediaCleanupService {
  private readonly logger = new Logger(MediaCleanupService.name);

  constructor(
    private prisma: PrismaService,
    private r2: R2Service,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.log('Starting media cleanup...');

    // 1. Find media older than 24 hours that is NOT used
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const orphans = await this.prisma.media.findMany({
      where: {
        isUsed: false,
        createdAt: { lt: yesterday },
      },
    });

    for (const file of orphans) {
      try {
        // 2. Delete from Cloudflare R2
        await this.r2.deleteFile(file.fileKey);

        // 3. Delete from Database
        await this.prisma.media.delete({ where: { id: file.id } });
      } catch (err) {
        this.logger.error(
          `Failed to cleanup file ${file.fileKey}: ${err.message}`,
        );
      }
    }

    this.logger.log(`Cleanup finished. Removed ${orphans.length} files.`);
  }
}
