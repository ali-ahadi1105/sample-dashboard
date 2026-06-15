import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // Mocking user db for now as PrismaService is to be fully implemented later.
  private users: any[] = [];

  async login(loginDto: LoginDto) {
    const user = this.users.find((u) => u.email === loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(registerDto.password, salt);
    
    const newUser = {
      id: Math.random().toString(36).substring(7),
      email: registerDto.email,
      passwordHash,
      role: Role.STAFF, // Default
      tenantId: 'mock-tenant-id', // Assign mock tenant
    };

    this.users.push(newUser);
    return { id: newUser.id, email: newUser.email };
  }
}
