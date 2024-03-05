import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService
    ) {}

  canActivate(context: ExecutionContext): boolean {
    //получение списка разрешенных ролей из декоратора @HasRoles()
    const requiredRoles = this.reflector.getAllAndOverride<String[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    //получаем и расшифровываем токен
    const rawHeaders = context.switchToHttp().getRequest().rawHeaders;
    const token = String(rawHeaders[1]).slice(7);
    const user = Object(this.jwtService.decode(token));

    //при совпадении хотя бы одной роли - возвращает true
    return requiredRoles.some((role) => user?.roles?.includes(role));
  }
}
