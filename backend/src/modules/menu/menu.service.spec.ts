import { Test, TestingModule } from '@nestjs/testing';
import { MenuService } from './menu.service';
import { RedisService } from '../../common/redis/redis.service';

describe('MenuService', () => {
  let service: MenuService;
  let redisServiceMock: Partial<RedisService>;

  beforeEach(async () => {
    redisServiceMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: RedisService,
          useValue: redisServiceMock,
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCustomerMenu', () => {
    it('should return cached menu if available', async () => {
      const tenantId = 'tenant1';
      const mockMenu = [{ id: '1', name: 'Category 1' }];
      (redisServiceMock.get as jest.Mock).mockResolvedValue(mockMenu);

      const result = await service.getCustomerMenu(tenantId);

      expect(redisServiceMock.get).toHaveBeenCalledWith(`menu:${tenantId}`);
      expect(result).toEqual(mockMenu);
    });

    it('should fetch from db and cache if cache miss', async () => {
      const tenantId = 'tenant1';
      (redisServiceMock.get as jest.Mock).mockResolvedValue(null);

      const result = await service.getCustomerMenu(tenantId);

      expect(redisServiceMock.get).toHaveBeenCalledWith(`menu:${tenantId}`);
      expect(redisServiceMock.set).toHaveBeenCalledWith(`menu:${tenantId}`, [], 3600);
      expect(result).toEqual([]); // since we mocked db call with []
    });
  });

  describe('updateMenuItem', () => {
    it('should update and invalidate cache', async () => {
      const tenantId = 'tenant1';
      const itemId = 'item1';
      const payload = { name: 'New Name' };

      const result = await service.updateMenuItem(tenantId, itemId, payload);

      expect(redisServiceMock.del).toHaveBeenCalledWith(`menu:${tenantId}`);
      expect(result).toEqual({ success: true, updatedItemId: itemId });
    });
  });

  describe('updateCategory', () => {
    it('should update and invalidate cache', async () => {
      const tenantId = 'tenant1';
      const categoryId = 'cat1';
      const payload = { name: 'New Name' };

      const result = await service.updateCategory(tenantId, categoryId, payload);

      expect(redisServiceMock.del).toHaveBeenCalledWith(`menu:${tenantId}`);
      expect(result).toEqual({ success: true, updatedCategoryId: categoryId });
    });
  });
});
