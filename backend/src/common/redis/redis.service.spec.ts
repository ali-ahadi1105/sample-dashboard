import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

describe('RedisService', () => {
  let service: RedisService;
  let redisClientMock: Partial<Redis>;

  beforeEach(async () => {
    redisClientMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: 'REDIS_CLIENT',
          useValue: redisClientMock,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return null if key does not exist', async () => {
      (redisClientMock.get as jest.Mock).mockResolvedValue(null);
      const result = await service.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should return parsed JSON object', async () => {
      const mockData = { test: 'value' };
      (redisClientMock.get as jest.Mock).mockResolvedValue(JSON.stringify(mockData));
      const result = await service.get('existent-key');
      expect(result).toEqual(mockData);
    });

    it('should return raw string if not JSON', async () => {
      (redisClientMock.get as jest.Mock).mockResolvedValue('raw-string');
      const result = await service.get('existent-key');
      expect(result).toEqual('raw-string');
    });
  });

  describe('set', () => {
    it('should stringify and set object', async () => {
      const mockData = { test: 'value' };
      await service.set('test-key', mockData);
      expect(redisClientMock.set).toHaveBeenCalledWith('test-key', JSON.stringify(mockData));
    });

    it('should set with ttl if provided', async () => {
      const mockData = { test: 'value' };
      await service.set('test-key', mockData, 3600);
      expect(redisClientMock.set).toHaveBeenCalledWith('test-key', JSON.stringify(mockData), 'EX', 3600);
    });

    it('should set raw string', async () => {
      await service.set('test-key', 'raw-string');
      expect(redisClientMock.set).toHaveBeenCalledWith('test-key', 'raw-string');
    });
  });

  describe('del', () => {
    it('should delete key', async () => {
      await service.del('test-key');
      expect(redisClientMock.del).toHaveBeenCalledWith('test-key');
    });
  });
});
