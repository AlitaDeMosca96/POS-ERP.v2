import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { TwoFactorCryptoService } from './two-factor-crypto.service';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import { Rol } from '../usuarios/enums/rol.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly twoFactorCrypto: TwoFactorCryptoService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usuariosService.findByEmail(email);

    if (!user) return null;

    if (user.bloqueadoHasta && user.bloqueadoHasta > new Date()) {
      throw new UnauthorizedException(`Cuenta bloqueada. Intente de nuevo después de las ${user.bloqueadoHasta.toLocaleTimeString()}`);
    }

    if (user.rol === Rol.SUPER_ADMIN) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      await this.usuariosService.registrarIntentoFallido(email);
      return null;
    }

    await this.usuariosService.resetearIntentosFallidos(email);

    const { password, twoFactorSecret, intentosFallidos, bloqueadoHasta, ...result } = user;
    return result;
  }

  async login(user: any, isImpersonation: boolean = false) {
    const payload = {
      email: user.email,
      sub: user.id,
      rol: user.rol,
      empresaId: user.empresaId,
      sucursalId: user.sucursalId,
      isImpersonation
    };

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

    if (user.bloqueadoHasta && user.bloqueadoHasta > new Date()) {
      throw new UnauthorizedException(`Cuenta bloqueada. Intente de nuevo después de las ${user.bloqueadoHasta.toLocaleTimeString()}`);
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      await this.usuariosService.registrarIntentoFallido(email);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.twoFactorEnabled) {
      if (!code2FA) {
        return { require2FA: true, message: 'Se requiere código de autenticación' };
      }
      const secret = this.twoFactorCrypto.decrypt(user.twoFactorSecret);
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: code2FA,
      });
      if (!verified) {
        await this.usuariosService.registrarIntentoFallido(email);
        throw new UnauthorizedException('Código 2FA inválido o expirado');
      }
    }

    await this.usuariosService.resetearIntentosFallidos(email);

    return this.login(user);
  }

  async generateTwoFactorAuthenticationSecret(userId: string, code2FA?: string) {
    const baseUser = await this.usuariosService.findOne(userId);
    if (!baseUser) throw new UnauthorizedException('Usuario no encontrado');

    const user = await this.usuariosService.findByEmail(baseUser.email);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    if (user.twoFactorEnabled) {
      if (!code2FA) {
        throw new BadRequestException('Se requiere un código 2FA vigente para regenerar el secreto');
      }
      const currentSecret = this.twoFactorCrypto.decrypt(user.twoFactorSecret);
      const verified = speakeasy.totp.verify({
        secret: currentSecret,
        encoding: 'base32',
        token: code2FA,
      });
      if (!verified) {
        throw new UnauthorizedException('Código 2FA inválido o expirado');
      }
    }

    const secret = speakeasy.generateSecret({ name: `POS-ERP MASTER (${user.email})` });

    await this.usuariosService.update(userId, {
      twoFactorSecret: this.twoFactorCrypto.encrypt(secret.base32),
      twoFactorEnabled: false
    } as any);

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url
    };
  }

  async turnOnTwoFactorAuthentication(userId: string, code2FA: string) {
    const baseUser = await this.usuariosService.findOne(userId);
    if (!baseUser) throw new UnauthorizedException('Usuario no encontrado');

    const user = await this.usuariosService.findByEmail(baseUser.email);

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('No hay secreto 2FA generado. Por favor, recargá la página.');
    }

    const secret = this.twoFactorCrypto.decrypt(user.twoFactorSecret);
    const verified = speakeasy.totp.verify({
      secret,
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