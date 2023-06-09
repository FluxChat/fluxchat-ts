import { createHash } from 'crypto';

function sha256(data: Buffer): Buffer {
  const hash = createHash('sha256');
  return hash.update(data).digest();
}

(() => {
  const data = '25f31060-cffc-4fe7-a66f-2cd68c0f687e';
  const nonce = 22534528;
  const bits = 15;

  const inputData = Buffer.concat([
    Buffer.from('FC:'),
    Buffer.from(bits.toString()),
    Buffer.from(':'),
    Buffer.from(data),
    Buffer.from(':'),
    Buffer.from(nonce.toString()),
  ]);

  const digest_b = sha256(inputData);
  const digest_h = digest_b.toString('hex');

  console.log(digest_b);
  console.log(digest_h);

})();
