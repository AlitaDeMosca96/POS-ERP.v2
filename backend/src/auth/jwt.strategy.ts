import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly configService: ConfigService
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('FATAL ERROR: JWT_SECRET no está definido en el archivo .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    let usuario;
    try {
      usuario = await this.usuariosService.findOne(payload.sub);
    } catch (error) {
      throw new UnauthorizedException('Token inválido o usuario inexistente');
    }
    
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Token inválido o usuario inactivo');
    }

    if (usuario.empresa && !usuario.empresa.activa) {
      throw new UnauthorizedException('La cuenta de la empresa está suspendida');
    }

    // IMPORTANTE: Devolvemos usuario.rol (de la BD) y no payload.rol (del token)
    return { 
      id: usuario.id, 
      email: usuario.email, 
      rol: usuario.rol, 
      empresaId: usuario.empresaId,
      sucursalId: usuario.sucursalId,
      isImpersonation: payload.isImpersonation || false // <-- NUEVO
    };
  }
}