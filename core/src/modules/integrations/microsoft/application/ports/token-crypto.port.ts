export const TOKEN_CRYPTO = Symbol('TOKEN_CRYPTO');

export interface TokenCryptoPort {
  encrypt(plain: string): string;
  decrypt(payload: string): string;
}
