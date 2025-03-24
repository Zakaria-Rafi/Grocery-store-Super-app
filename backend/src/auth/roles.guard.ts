import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  // canActivate method to check if the user has the required role
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // No roles required for this route
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // User added via Auth middleware

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied');
    }
    return true;
  }
}
