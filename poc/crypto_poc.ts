
import * as crypto from 'crypto';

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
	modulusLength: 4096,
});

console.log(publicKey);
console.log(privateKey);

console.log(
  publicKey.export({
    type: 'pkcs1',
    format: 'pem',
  }),

  privateKey.export({
    type: 'pkcs1',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase: 'password',
  })
);

// const options = {
//   type: "pkcs1",
//   format:"pem",
//   passphrase:"YOUR PASSPHRASE"
// }
// const exportedPublic = publicKey.export(options);
// const exportedPrivate = privateKey.export(options);
