import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib'; // <-- IMPORTAMOS EL OBJETO
import * as qrcode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuariosService.findByEmail(loginDto.email);
    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');

    if (usuario.empresa && !usuario.empresa.activa) {
      throw new UnauthorizedException('La cuenta de su empresa se encuentra suspendida. Contacte a soporte.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, usuario.password);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciales incorrectas');

    const payload = { 
      sub: usuario.id, 
      email: usuario.email, 
      rol: usuario.rol, 
      empresaId: usuario.empresaId,
      sucursalId: usuario.sucursalId
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        empresaId: usuario.empresaId,
        sucursalId: usuario.sucursalId
      }
    };
  }

  async masterLogin(loginDto: LoginDto) {
    const usuario = await this.usuariosService.findByEmail(loginDto.email);
    
    if (!usuario || usuario.rol !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Acceso denegado al sistema maestro');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, usuario.password);
    if (!isPasswordValid) throw new UnauthorizedException('Acceso denegado al sistema maestro');

    if (usuario.twoFactorEnabled) {
      if (!loginDto.twoFactorCode) {
        throw new BadRequestException('Se requiere código 2FA');
      }
      const isValid = authenticator.verify({ token: loginDto.twoFactorCode, secret: usuario.twoFactorSecret });
      if (!isValid) {
        throw new UnauthorizedException('Código 2FA inválido');
      }
    }

    const payload = { 
      sub: usuario.id, 
      email: usuario.email, 
      rol: usuario.rol, 
      empresaId: usuario.empresaId
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        empresaId: usuario.empresaId
      }
    };
  }

  async generate2FASecret(userId: string, email: string) {
    // USAMOS authenticator.generateSecret()
    const secret = authenticator.generateSecret();
    
    await this.usuariosService.update(userId, { twoFactorSecret: secret, twoFactorEnabled: false } as any);

    // USAMOS authenticator.keyuri()
    const otpauthUrl = authenticator.keyuri(email, 'MasterCtrl SaaS', secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    return { secret, qrCodeDataUrl };
  }

  async turnOn2FA(userId: string, code: string) {
    const usuario = await this.usuariosService.findOne(userId);
    if (!usuario || !usuario.twoFactorSecret) throw new BadRequestException('No hay secreto generado');

    const isValid = authenticator.verify({ token: code, secret: usuario.twoFactorSecret });
    if (!isValid) throw new UnauthorizedException('Código inválido. Intentá de nuevo.');

    await this.usuariosService.update(userId, { twoFactorEnabled: true } as any);
    return { success: true };
  }
}