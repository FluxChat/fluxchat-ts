
import { createPublicKey, createHash, pbkdf2Sync } from 'crypto';
import { readFileSync } from 'fs';
import { encode as b58enc } from 'bs58';

export function passwordKeyDerivation(password: string): string {
  const iterations_s = process.env.FLUXCHAT_KEY_DERIVATION_ITERATIONS || '600000';
  const iterations_i = parseInt(iterations_s, 10);

  const pkd_b = pbkdf2Sync(password, 'FluxChat_Static_Salt', iterations_i, 64, 'sha256');
  const pkd_s = pkd_b.toString('base64');
  return pkd_s;
}

export function generateIdFromPublicKeyFile(path: string): string {
  const publicKey = createPublicKey(readFileSync(path));
  const pkExport = publicKey.export({ type: 'spki', format: 'der' });
  const publicKeyHash = createHash('sha256').update(pkExport).digest();
  const publicKeyHash_bs58 = b58enc(publicKeyHash);

  return `FC_${publicKeyHash_bs58}`;
}
