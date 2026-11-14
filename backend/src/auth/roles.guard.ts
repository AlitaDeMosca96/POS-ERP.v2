import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Si no hay roles requeridos, permite el paso (ej. para el login)
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    
    // Verifica si el rol del usuario está en la lista permitida
    if (requiredRoles.includes(user.rol)) {
      return true;
    }
    
    throw new ForbiddenException('No tenés permisos para realizar esta acción.');
  }
}