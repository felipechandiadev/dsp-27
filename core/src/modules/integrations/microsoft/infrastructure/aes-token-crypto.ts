import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { AppConfigService } from '@config/config.service';
import { TokenCryptoPort } from '../application/ports/token-crypto.port';

@Injectable()
export class AesTokenCrypto implements TokenCryptoPort {
  constructor(private readonly config: AppConfigService) {}

  private key(): Buffer {
    const raw = this.config.microsoft.tokenEncryptionKey;
    if (!raw || raw.length < 32) {
      throw new ServiceUnavailableException(
        'Microsoft token encryption key no configurada',
      );
    }
    return createHash('sha256').update(raw).digest();
  }

  encrypt(plain: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key(), iv);
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64url')}.${tag.toString('base64url')}.${enc.toString('base64url')}`;
  }

  decrypt(payload: string): string {
    const [ivB64, tagB64, dataB64] = payload.split('.');
    if (!ivB64 || !tagB64 || !dataB64) {
      throw new Error('Token cifrado inválido');
    }
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.key(),
      Buffer.from(ivB64, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));
    const dec = Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64url')),
      decipher.final(),
    ]);
    return dec.toString('utf8');
  }
}
