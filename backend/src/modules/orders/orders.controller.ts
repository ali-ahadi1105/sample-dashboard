import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post(':tenantId')
  @ApiOperation({ summary: 'Create a new order and emit WS event' })
  createOrder(@Param('tenantId') tenantId: string, @Body() payload: any) {
    return this.ordersService.createOrder(tenantId, payload);
  }
}
