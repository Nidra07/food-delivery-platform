import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { LoginDto, RegisterDto } from './auth.dto';
import { Role } from '../database/entities/role.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.users.findOne({ where: { email } })) throw new ConflictException('Email already registered');
    const customerRole = await this.roles.findOneByOrFail({ name: 'CUSTOMER' });
    const user = this.users.create({
      email,
      phone: dto.phone ?? null,
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
      passwordHash: await bcrypt.hash(dto.password, Number(process.env.BCRYPT_ROUNDS ?? 12)),
      roles: [customerRole],
      status: 'ACTIVE',
    });
    return this.issue(await this.users.save(user));
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email.trim().toLowerCase() } });
    if (!user || user.status !== 'ACTIVE' || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issue(user);
  }

  private async issue(user: User) {
    const payload = { sub: user.id, email: user.email, roles: user.roles.map((role) => role.name) };
    return { accessToken: await this.jwt.signAsync(payload), user: this.safeUser(user) };
  }

  private safeUser(user: User) {
    return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, roles: user.roles.map((role) => role.name) };
  }
}
