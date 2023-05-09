
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as base58 from 'bs58';

export function passwordKeyDerivation(password: string): string {
  const iterations_s = process.env.FLUXCHAT_KEY_DERIVATION_ITERATIONS || '600000';
  const iterations_i = parseInt(iterations_s, 10);

  const pkd_b = crypto.pbkdf2Sync(password, 'FluxChat_Static_Salt', iterations_i, 64, 'sha256');
  const pkd_s = pkd_b.toString('base64');
  return pkd_s;
}

export function generateIdFromPublicKeyFile(path: string): string {
  const publicKey = crypto.createPublicKey(fs.readFileSync(path));
  // console.warn('publicKey', publicKey, typeof publicKey);

  const pkExport = publicKey.export({ type: 'spki', format: 'der' });
  // console.warn('pkExport', pkExport, typeof pkExport);

  // const pkRaw = Buffer.from(pkExport.toString().split('\n').slice(1, -1).join(''), 'base64');
  // console.warn('pkRaw', pkRaw, typeof pkRaw);

  const publicKeyHash = crypto.createHash('sha256').update(pkExport).digest();
  // console.warn('publicKeyHash', publicKeyHash, typeof publicKeyHash);

  const publicKeyHash_bs58 = base58.encode(publicKeyHash);

  return `FC_${publicKeyHash_bs58}`;
}
