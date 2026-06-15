import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';

describe('OrdersService', () => {
  let service: OrdersService;
  let gatewayMock: Partial<OrdersGateway>;

  beforeEach(async () => {
    gatewayMock = {
      notifyOrderCreated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersGateway, useValue: gatewayMock },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create order and notify gateway', async () => {
      const order = await service.createOrder('tenant1', { totalAmount: 50 });
      expect(order).toHaveProperty('id');
      expect(order.tenantId).toEqual('tenant1');
      expect(order.status).toEqual('PENDING');
      expect(order.totalAmount).toEqual(50);
      expect(gatewayMock.notifyOrderCreated).toHaveBeenCalledWith('tenant1', order);
    });
  });
});
