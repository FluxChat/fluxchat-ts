
import { Argument } from '../src/lib/network';

(() => {
  console.log('\x6e' === 'n');
  console.log(110 === 'n'.charCodeAt(0));

  const b1 = Buffer.from('ABCD', 'binary');
  const b2 = Buffer.from([0x87, 0x93, 0x6e, 0x04]);

  const b3 = Buffer.alloc(4, 0xFF);
  b3.write('ABCDEF', 0, 4, 'binary');

  const b4 = Buffer.alloc(4, 0xFF);
  const written = b4.write('ABCDEF', 1);

  const b5 = Buffer.alloc(4, '\x87\x93\x6e\x04\xFF\xFF', 'binary');
  const n = b5.readUInt32LE();

  const arg1 = new Argument('\x87\x93\x6e\x04');
  console.log(arg1.asInt());

  const arg2 = new Argument('\x41');
  console.log(arg2.asInt());
})();
