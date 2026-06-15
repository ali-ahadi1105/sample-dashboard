import { Module } from '@nestjs/common';
import { RedisModule } from './common/redis/redis.module';
import { MenuModule } from './modules/menu/menu.module';

import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';

import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
      },
    }),
    RedisModule, // Global Cache Service
    MenuModule,  // Menu Feature Module
    AuthModule,
    OrdersModule,
  ],
  controllers: []
})
export class AppModule {}
