import { Module, Global, Provider } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import Redis from 'ioredis';
import { CacheService } from './cache.service';
import { REDIS_CLIENT } from './redis.constants';

// Reusable connection config
const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null, // Critical for BullMQ
};

const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    const redisInstance = new Redis(redisConnection);
    redisInstance.on('error', (e) => console.error('Redis Error', e));
    return redisInstance;
  },
};

@Global()
@Module({
  imports: [
    // This provides the connection to BullMQ Workers/Processors
    BullModule.forRoot({
      connection: redisConnection,
    }),
  ],
  providers: [RedisProvider, CacheService],
  exports: [REDIS_CLIENT, CacheService, BullModule],
})
export class RedisModule {}
