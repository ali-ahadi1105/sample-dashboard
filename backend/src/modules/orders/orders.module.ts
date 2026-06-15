import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OrdersGateway } from './orders.gateway';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
    }),
  ],
  providers: [OrdersGateway, OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
