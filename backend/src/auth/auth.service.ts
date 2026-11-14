import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuariosService.findByEmail(loginDto.email);
    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');

    const isPasswordValid = await bcrypt.compare(loginDto.password, usuario.password);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciales incorrectas');

    const payload = { 
      sub: usuario.id, 
      email: usuario.email, 
      rol: usuario.rol, 
      empresaId: usuario.empresaId,
      sucursalId: usuario.sucursalId // <-- AGREGAMOS LA SUCURSAL AL TOKEN
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        empresaId: usuario.empresaId,
        sucursalId: usuario.sucursalId // <-- Y AL PERFIL DEL USUARIO
      }
    };
  }
}