
import { pbkdf2Sync } from 'crypto';

export function passwordKeyDerivation(password: string): string {
  const iterations_s = process.env.FLUXCHAT_KEY_DERIVATION_ITERATIONS || '600000'
  const iterations_i = parseInt(iterations_s, 10);
  // const salt = Buffer.from('FluxChat_Static_Salt');
  const salt = 'FluxChat_Static_Salt';
  const keyLength = 64;

  const pkd_b = pbkdf2Sync(password, salt, iterations_i, keyLength, 'sha256');
  const pkd_s = pkd_b.toString('base64');
  return pkd_s;
}
