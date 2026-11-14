import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usuariosService: UsuariosService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'mi_palabra_secreta_super_segura_123',
    });
  }

  async validate(payload: any) {
    const usuario = await this.usuariosService.findOne(payload.sub);
    
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Token inválido o usuario inactivo');
    }

    // Si la empresa fue suspendida, bloqueamos la petición inmediatamente (arregla el bug de las 8hs)
    if (usuario.empresa && !usuario.empresa.activa) {
      throw new UnauthorizedException('La cuenta de la empresa está suspendida');
    }

    return { 
      id: payload.sub, 
      email: payload.email, 
      rol: payload.rol, 
      empresaId: payload.empresaId,
      sucursalId: payload.sucursalId // <-- AHORA SÍ DEVOLVEMOS LA SUCURSAL
    };
  }
}