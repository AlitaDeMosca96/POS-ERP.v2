import { MigrationInterface, QueryRunner } from 'typeorm';
import * as crypto from 'crypto';

export class EncryptTwoFactorSecrets1794713500000 implements MigrationInterface {
  name = 'EncryptTwoFactorSecrets1794713500000';

  private loadKey(): Buffer {
    const rawKey = process.env.TOTP_ENCRYPTION_KEY;
    if (!rawKey) {
      throw new Error('TOTP_ENCRYPTION_KEY no está definida. Definirla antes de correr esta migración.');
    }
    let key: Buffer;
    if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
      key = Buffer.from(rawKey, 'hex');
    } else {
      key = Buffer.from(rawKey, 'base64');
    }
    if (key.length !== 32) {
      throw new Error('TOTP_ENCRYPTION_KEY debe decodificar a 32 bytes.');
    }
    return key;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const key = this.loadKey();
    const usuarios: { id: string; twoFactorSecret: string }[] = await queryRunner.query(
      `SELECT id, "twoFactorSecret" FROM usuarios WHERE "twoFactorSecret" IS NOT NULL`
    );

    for (const u of usuarios) {
      if (/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i.test(u.twoFactorSecret)) {
        continue;
      }
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
      const encrypted = Buffer.concat([cipher.update(u.twoFactorSecret, 'utf8'), cipher.final()]);
      const authTag = cipher.getAuthTag();
      const payload = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
      await queryRunner.query(`UPDATE usuarios SET "twoFactorSecret" = $1 WHERE id = $2`, [payload, u.id]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const key = this.loadKey();
    const usuarios: { id: string; twoFactorSecret: string }[] = await queryRunner.query(
      `SELECT id, "twoFactorSecret" FROM usuarios WHERE "twoFactorSecret" IS NOT NULL`
    );

    for (const u of usuarios) {
      if (!/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i.test(u.twoFactorSecret)) {
        continue;
      }
      const [ivHex, tagHex, dataHex] = u.twoFactorSecret.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      const data = Buffer.from(dataHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);
      const plaintext = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
      await queryRunner.query(`UPDATE usuarios SET "twoFactorSecret" = $1 WHERE id = $2`, [plaintext, u.id]);
    }
  }
}