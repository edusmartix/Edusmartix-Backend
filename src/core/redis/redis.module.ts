import { Module, Global, Provider } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheService } from './cache.service';
import { REDIS_CLIENT } from './redis.constants';

const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService], // Inject ConfigService to get envs safely
  useFactory: (configService: ConfigService) => {
    const redisInstance = new Redis({
      host: configService.get<string>('REDIS_HOST', '127.0.0.1'),
      port: configService.get<number>('REDIS_PORT', 6379),
      maxRetriesPerRequest: null, // Critical for BullMQ
    });

    redisInstance.on('error', (e) => console.error('Redis Error', e));
    return redisInstance;
  },
};

@Global()
@Module({
  imports: [
    // Use forRootAsync to wait for ConfigService
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', '127.0.0.1'),
          port: configService.get<number>('REDIS_PORT', 6379),
          maxRetriesPerRequest: null,
        },
      }),
    }),
  ],
  providers: [RedisProvider, CacheService],
  exports: [REDIS_CLIENT, CacheService, BullModule],
})
export class RedisModule {}
