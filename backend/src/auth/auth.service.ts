import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { TwoFactorCryptoService } from './two-factor-crypto.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { Rol } from '../usuarios/enums/rol.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly twoFactorCrypto: TwoFactorCryptoService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usuariosService.findByEmail(email);

    if (!user) {
      await this.auditoriaService.registrar(null, null, 'AUTH', null, 'LOGIN_FAIL', null, { email }, 'Usuario no encontrado');
      return null;
    }

    if (user.bloqueadoHasta && user.bloqueadoHasta > new Date()) {
      throw new UnauthorizedException(`Cuenta bloqueada. Intente de nuevo después de las ${user.bloqueadoHasta.toLocaleTimeString()}`);
    }

    if (user.rol === Rol.SUPER_ADMIN) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      await this.usuariosService.registrarIntentoFallido(email);
      await this.auditoriaService.registrar(user.empresaId, user.id, 'AUTH', user.id, 'LOGIN_FAIL', null, null, 'Contraseña incorrecta');
      return null;
    }

    await this.usuariosService.resetearIntentosFallidos(email);
    await this.auditoriaService.registrar(user.empresaId, user.id, 'AUTH', user.id, 'LOGIN_SUCCESS', null, null, 'Inicio de sesión exitoso');

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
      await this.auditoriaService.registrar(null, null, 'AUTH', null, 'MASTER_LOGIN_FAIL', null, { email }, 'Credenciales inválidas o no es Super Admin');
      throw new UnauthorizedException('Credenciales inválidas o no es Super Admin');
    }

    if (user.bloqueadoHasta && user.bloqueadoHasta > new Date()) {
      throw new UnauthorizedException(`Cuenta bloqueada. Intente de nuevo después de las ${user.bloqueadoHasta.toLocaleTimeString()}`);
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      await this.usuariosService.registrarIntentoFallido(email);
      await this.auditoriaService.registrar(null, user.id, 'AUTH', user.id, 'MASTER_LOGIN_FAIL', null, null, 'Contraseña incorrecta');
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.twoFactorEnabled) {
      if (!code2FA) {
        return { require2FA: true, message: 'Se requiere código de autenticación' };
      }
      const secret = this.twoFactorCrypto.decrypt(user.twoFactorSecret);
      const verified = authenticator.check(code2FA, secret);
      
      if (!verified) {
        await this.usuariosService.registrarIntentoFallido(email);
        await this.auditoriaService.registrar(null, user.id, 'AUTH', user.id, 'MASTER_LOGIN_FAIL', null, null, 'Código 2FA inválido');
        throw new UnauthorizedException('Código 2FA inválido o expirado');
      }
    }

    await this.usuariosService.resetearIntentosFallidos(email);
    await this.auditoriaService.registrar(null, user.id, 'AUTH', user.id, 'MASTER_LOGIN_SUCCESS', null, null, 'Inicio de sesión maestra exitoso');

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
      const verified = authenticator.check(code2FA, currentSecret);
      
      if (!verified) {
        throw new UnauthorizedException('Código 2FA inválido o expirado');
      }
    }

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'POS-ERP MASTER', secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    await this.usuariosService.update(userId, {
      twoFactorSecret: this.twoFactorCrypto.encrypt(secret),
      twoFactorEnabled: false
    } as any);

    return {
      secret: secret,
      qrCodeDataUrl: qrCodeDataUrl
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
    const verified = authenticator.check(code2FA, secret);

    if (!verified) {
      throw new UnauthorizedException('Código inválido. Verificá la hora de tu celular.');
    }

    await this.usuariosService.update(userId, { twoFactorEnabled: true } as any);
    await this.auditoriaService.registrar(null, user.id, 'AUTH', user.id, '2FA_ENABLED', null, null, '2FA Activado correctamente');
    
    return { success: true, message: '2FA Activado correctamente' };
  }
}