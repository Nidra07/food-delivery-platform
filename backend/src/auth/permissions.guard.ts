import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PERMISSIONS_KEY } from './access.decorator';
import { Role } from '../database/entities/role.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
    if (!required?.length) return true;
    const request = context.switchToHttp().getRequest<{ user?: { roles?: string[] } }>();
    const roleNames = request.user?.roles ?? [];
    const roles = await this.roles.find({ where: roleNames.map((name) => ({ name })) });
    const permissions = new Set(roles.flatMap((role) => role.permissions?.map((permission) => permission.code) ?? []));
    if (!required.every((permission) => permissions.has(permission))) throw new ForbiddenException('Insufficient permission');
    return true;
  }
}
