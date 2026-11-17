import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '../usuarios/enums/rol.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Rol[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // Si la ruta no pide roles específicos, pasa (pero igual requiere estar logueado por el JwtAuthGuard)
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) return false; // Si pide roles y no hay usuario, rebota.
    
    return requiredRoles.some((role) => user.rol === role);
  }
}