import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class TwoFactorCryptoService {
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const raw = this.configService.get<string>('TOTP_ENCRYPTION_KEY');
    if (!raw) {
      throw new Error('FATAL ERROR: TOTP_ENCRYPTION_KEY no está definido en el archivo .env');
    }

    let key: Buffer;
    if (/^[0-9a-fA-F]{64}$/.test(raw)) {
      key = Buffer.from(raw, 'hex');
    } else {
      key = Buffer.from(raw, 'base64');
    }

    if (key.length !== 32) {
      throw new Error('FATAL ERROR: TOTP_ENCRYPTION_KEY debe decodificar a exactamente 32 bytes (AES-256).');
    }
    this.key = key;
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(payload: string): string {
    if (!this.isEncrypted(payload)) {
      throw new InternalServerErrorException(
        'El secreto 2FA almacenado no está cifrado. Ejecutar la migración EncryptTwoFactorSecrets.'
      );
    }
    const parts = payload.split(':');
    if (parts.length !== 3) {
      throw new InternalServerErrorException('Formato de secreto 2FA inválido.');
    }
    const [ivHex, tagHex, dataHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const data = Buffer.from(dataHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);
    try {
      return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
    } catch {
      throw new InternalServerErrorException(
        'No se pudo descifrar el secreto 2FA. Verificar TOTP_ENCRYPTION_KEY.'
      );
    }
  }

  isEncrypted(payload: string | null | undefined): boolean {
    if (!payload) return false;
    return /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i.test(payload);
  }
}