
// import { strict } from 'assert';

(() => {
  // console.log(this);

  const value = '\x87\x93\x6e\x04';

  const buf1 = Buffer.alloc(4);
  buf1.write(value, 'binary');
  const n = buf1.readUInt32LE();
})();
