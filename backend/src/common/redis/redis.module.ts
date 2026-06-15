import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        if (!process.env.REDIS_URL) {
          console.warn('REDIS_URL is not set. Using ioredis-mock.');
          return new RedisMock();
        }
        return new Redis(process.env.REDIS_URL);
      },
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
