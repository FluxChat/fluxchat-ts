import { createHash } from 'crypto';

function sha256(data: Buffer): Buffer {
  const hash = createHash('sha256');
  return hash.update(data).digest();
}

(() => {
  const bits = 10;
  const nonce = 0;
  const data = Buffer.from('test');

  const inputData = Buffer.concat([
    Buffer.from('FC:'),
    Buffer.from(bits.toString()),
    Buffer.from(':'),
    data,
    Buffer.from(':'),
    Buffer.from(nonce.toString()),
  ]);

  const digest_b = sha256(inputData);
  const digest_h = digest_b.toString('hex');

  console.log(digest_b);
  console.log(digest_h);

})();
