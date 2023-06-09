
import { inspect as i } from 'util';

(() => {
  const value = '\x87\x93\x6e\x04';

  const buf1 = Buffer.alloc(4);
  buf1.write(value, 'binary');
  const n = buf1.readUInt32LE();

  const buf2 = Buffer.alloc(255);
  buf2.write('ABCD', 'binary');
  console.log(buf2.toString('binary'));

  console.log(i(buf2, {
    compact: false,
  }));

  console.log(i([...buf2], {
    // showHidden: true,
    // depth: 1000,
    // colors: true,
    // breakLength: 1000,
    maxArrayLength: 1000,
  }));


  const buf3 = Buffer.from('ABC');
})();
