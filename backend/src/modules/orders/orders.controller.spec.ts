import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let serviceMock: Partial<OrdersService>;

  beforeEach(async () => {
    serviceMock = {
      createOrder: jest.fn().mockResolvedValue({ id: '1', tenantId: 'tenant1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: serviceMock },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should call createOrder on service', async () => {
      const res = await controller.createOrder('tenant1', { totalAmount: 50 });
      expect(serviceMock.createOrder).toHaveBeenCalledWith('tenant1', { totalAmount: 50 });
      expect(res).toEqual({ id: '1', tenantId: 'tenant1' });
    });
  });
});
