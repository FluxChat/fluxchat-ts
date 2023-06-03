// Diffie-Hellman Key Exchange
// Thx Mr Bailey Whitfield Diffie and Mr Martin Hellman, you are awesome!

import { readFileSync } from 'fs';
import { strictEqual } from 'assert';
import { createDiffieHellman } from 'crypto';

// resources/crypto/dhparam.hex holds only the prime number in hex format
// generated with:
//      openssl dhparam -out resources/crypto/dhparam.pem 4096
//      openssl dhparam -text -noout -in resources/crypto/dhparam.pem
const dhparamHex = readFileSync('resources/crypto/dhparam.hex').toString();
console.log('dhparamHex', dhparamHex);

const parameters = createDiffieHellman(dhparamHex, 'hex', 2);
console.log('parameters', parameters, parameters.verifyError);

const alicePublicKey = parameters.generateKeys();
console.log('alicePublicKey', alicePublicKey.length, alicePublicKey);

const bobPublicKey = parameters.generateKeys();
console.log('bobPublicKey', bobPublicKey.length, bobPublicKey);

// Exchange and generate the secret...
const aliceSecret = parameters.computeSecret(bobPublicKey);
const bobSecret = parameters.computeSecret(alicePublicKey);

console.log('aliceSecret', aliceSecret.length, aliceSecret.toString('hex'));
console.log('bobSecret', bobSecret.length, bobSecret.toString('hex'));

strictEqual(aliceSecret.toString('hex'), bobSecret.toString('hex'));
