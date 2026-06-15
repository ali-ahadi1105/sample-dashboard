import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: Partial<AuthService>;

  beforeEach(async () => {
    authServiceMock = {
      login: jest.fn().mockResolvedValue({ access_token: 'token123' }),
      register: jest.fn().mockResolvedValue({ id: '1', email: 'test@test.com' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const dto = { email: 'test@test.com', password: 'password' };
      const res = await controller.login(dto);
      expect(res).toEqual({ access_token: 'token123' });
      expect(authServiceMock.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const dto = { email: 'test@test.com', password: 'password' };
      const res = await controller.register(dto);
      expect(res).toEqual({ id: '1', email: 'test@test.com' });
      expect(authServiceMock.register).toHaveBeenCalledWith(dto);
    });
  });
});
