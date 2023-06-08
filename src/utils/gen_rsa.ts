// This should be done by 'openssl genrsa', but as we already using the
// NodeJS crypto module, we can use it to generate the RSA key pair.

import * as crypto from 'crypto';
// import {KeyPairKeyObjectResult} from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

(() => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
  });

  const publicKeySpki = publicKey.export({ type: 'spki', format: 'der' });
  console.log(publicKeySpki);

  const privateKeyPath = path.resolve(process.env.FLUXCHAT_DATA_DIR || 'var/data', 'private_key.pem');
  const publicKeyPath = path.resolve(process.env.FLUXCHAT_DATA_DIR || 'var/data', 'public_key.pem');
  const certificatePath = path.resolve(process.env.FLUXCHAT_DATA_DIR || 'var/data', 'certificate.pem');

  console.log(privateKeyPath);
  console.log(publicKeyPath);
  console.log(certificatePath);

  const privateKeyHandle = fs.createWriteStream(privateKeyPath, { mode: 0o600 });
  privateKeyHandle.write(privateKey.export({
    type: 'pkcs1',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase: process.env.FLUXCHAT_KEY_PASSWORD || 'password',
  }));
  privateKeyHandle.end();

  const publicKeyHandle = fs.createWriteStream(publicKeyPath, { mode: 0o640 });
  publicKeyHandle.write(publicKey.export({
    type: 'spki',
    format: 'pem',
  }));
  publicKeyHandle.end();
})();
