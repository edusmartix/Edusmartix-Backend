import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService as BasePrismaService } from 'nestjs-prisma';

@Injectable()
export class PrismaService extends BasePrismaService implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  // You can add EduSmartix specific DB utilities here later
  // For example: a method to clear all data for testing
}
