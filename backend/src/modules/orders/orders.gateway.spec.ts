import { Test, TestingModule } from '@nestjs/testing';
import { OrdersGateway } from './orders.gateway';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

describe('OrdersGateway', () => {
  let gateway: OrdersGateway;
  let jwtServiceMock: Partial<JwtService>;

  beforeEach(async () => {
    jwtServiceMock = {
      verify: jest.fn().mockReturnValue({ tenantId: 'tenant1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersGateway,
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    gateway = module.get<OrdersGateway>(OrdersGateway);
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should disconnect if no token', async () => {
      const clientMock = {
        handshake: { auth: {}, query: {} },
        disconnect: jest.fn(),
      } as unknown as Socket;

      await gateway.handleConnection(clientMock);

      expect(clientMock.disconnect).toHaveBeenCalled();
    });

    it('should join tenant room if valid token', async () => {
      const clientMock = {
        handshake: { auth: { token: 'valid' }, query: {} },
        data: {},
        join: jest.fn(),
        disconnect: jest.fn(),
      } as unknown as Socket;

      await gateway.handleConnection(clientMock);

      expect(jwtServiceMock.verify).toHaveBeenCalledWith('valid', expect.any(Object));
      expect(clientMock.join).toHaveBeenCalledWith('room:orders:tenant1');
      expect(clientMock.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('notifyOrderCreated', () => {
    it('should emit order.created to tenant room', () => {
      gateway.notifyOrderCreated('tenant1', { id: 'order1' });
      expect(gateway.server.to).toHaveBeenCalledWith('room:orders:tenant1');
      expect(gateway.server.emit).toHaveBeenCalledWith('order.created', { id: 'order1' });
    });
  });
});
