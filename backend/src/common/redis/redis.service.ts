import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  /**
   * Generic get method mapping to Redis GET
   */
  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as any;
    }
  }

  /**
   * Generic set method mapping to Redis SET (with optional TTL)
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const stringifiedValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (ttlSeconds) {
      await this.redis.set(key, stringifiedValue, 'EX', ttlSeconds);
    } else {
      await this.redis.set(key, stringifiedValue);
    }
  }

  /**
   * Invalidate cache explicitly
   */
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
