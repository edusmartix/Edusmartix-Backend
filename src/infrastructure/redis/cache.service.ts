/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class CacheService {
  private readonly DEFAULT_TTL = 3600;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async cacheUser(userId: string, userData: any): Promise<void> {
    await this.redis.set(
      `user:${userId}`,
      JSON.stringify(userData),
      'EX',
      this.DEFAULT_TTL,
    );
  }

  async getCachedUser(userId: string): Promise<any | null> {
    const data = await this.redis.get(`user:${userId}`);
    return data ? JSON.parse(data) : null;
  }

  async invalidateUser(userId: string): Promise<void> {
    await this.redis.del(`user:${userId}`);
  }
}
