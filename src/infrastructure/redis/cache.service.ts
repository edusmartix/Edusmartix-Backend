import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class CacheService {
  private readonly DEFAULT_TTL = 3600; // 1 hour

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /**
   * Generic method to cache any data
   */
  async cacheData(
    key: string,
    value: any,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<void> {
    const data = typeof value === 'string' ? value : JSON.stringify(value);
    await this.redis.set(key, data, 'EX', ttl);
  }

  /**
   * Generic method to retrieve cached data
   */
  async getCachedData<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (!data) return null;

    try {
      // Try to parse as JSON, if it fails, return as string
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  }

  /**
   * Generic method to remove cached data
   */
  async invalidateData(key: string): Promise<void> {
    await this.redis.del(key);
  }

  // --- Specialized User Methods (keeping these for clean architecture) ---

  async cacheUser(userId: string, userData: any): Promise<void> {
    await this.cacheData(`user:${userId}`, userData);
  }

  async getCachedUser(userId: string): Promise<any | null> {
    return await this.getCachedData(`user:${userId}`);
  }

  async invalidateUser(userId: string): Promise<void> {
    await this.invalidateData(`user:${userId}`);
  }
}
