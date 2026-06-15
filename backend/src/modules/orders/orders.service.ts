import { Injectable } from '@nestjs/common';
import { OrdersGateway } from './orders.gateway';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersGateway: OrdersGateway) {}

  private orders: any[] = [];

  async createOrder(tenantId: string, payload: any) {
    const newOrder = {
      id: Math.random().toString(36).substring(7),
      tenantId,
      status: 'PENDING',
      ...payload,
      createdAt: new Date(),
    };

    // Database save mockup
    this.orders.push(newOrder);

    // Notify kitchen/staff in real-time
    this.ordersGateway.notifyOrderCreated(tenantId, newOrder);

    return newOrder;
  }
}
