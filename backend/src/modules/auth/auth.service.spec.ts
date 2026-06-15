import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtServiceMock: Partial<JwtService>;

  beforeEach(async () => {
    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('token123'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const user = await service.register({ email: 'test@test.com', password: 'password' });
      expect(user).toHaveProperty('id');
      expect(user.email).toEqual('test@test.com');
      // Assert it got added to mocked users array by trying to login
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const login = await service.login({ email: 'test@test.com', password: 'password' });
      expect(login.access_token).toEqual('token123');
    });
  });

  describe('login', () => {
    it('should throw unauthorized if user not found', async () => {
      await expect(service.login({ email: 'wrong@test.com', password: 'password' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw unauthorized if password incorrect', async () => {
      await service.register({ email: 'login@test.com', password: 'password' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login({ email: 'login@test.com', password: 'wrongpassword' })).rejects.toThrow(UnauthorizedException);
    });
  });
});
