import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { Rol } from '../usuarios/enums/rol.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usuariosService.findByEmail(email);
    if (user && user.rol === Rol.SUPER_ADMIN) return null;
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      const { password, twoFactorSecret, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, rol: user.rol, empresaId: user.empresaId, sucursalId: user.sucursalId };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, rol: user.rol, empresaId: user.empresaId }
    };
  }

  async masterLogin(email: string, pass: string, code2FA?: string) {
    const user = await this.usuariosService.findByEmail(email);
    if (!user || user.rol !== Rol.SUPER_ADMIN) {
      throw new UnauthorizedException('Credenciales inválidas o no es Super Admin');
    }
    if (!(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Si el 2FA está activo, pide el código
    if (user.twoFactorEnabled) {
      if (!code2FA) {
        return { require2FA: true, message: 'Se requiere código de autenticación' };
      }
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code2FA,
      });
      if (!verified) {
        throw new UnauthorizedException('Código 2FA inválido o expirado');
      }
    }

    return this.login(user);
  }

  async generateTwoFactorAuthenticationSecret(userId: string) {
    const user = await this.usuariosService.findOne(userId);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const secret = speakeasy.generateSecret({ name: `POS-ERP MASTER (${user.email})` });
    
    // Guardamos el secret en la BD, pero mantenemos el 2FA desactivado
    await this.usuariosService.update(userId, { twoFactorSecret: secret.base32, twoFactorEnabled: false } as any);

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url
    };
  }

  async turnOnTwoFactorAuthentication(userId: string, code2FA: string) {
    const user = await this.usuariosService.findByEmail((await this.usuariosService.findOne(userId)).email);
    
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('No hay secreto 2FA generado. Por favor, recargá la página.');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code2FA,
    });

    if (!verified) {
      throw new UnauthorizedException('Código inválido. Verificá la hora de tu celular.');
    }

    await this.usuariosService.update(userId, { twoFactorEnabled: true } as any);
    return { success: true, message: '2FA Activado correctamente' };
  }
}