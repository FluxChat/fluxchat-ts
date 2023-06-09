
import { describe, expect, test } from '@jest/globals';
import { Argument } from '../lib/network';

describe('Argument', () => {
  const testDataInt = [
    [ 65, 65 ],
    [ 256 * 256, 65536 ],
  ];
  test.each(testDataInt)('as integer %#', (input: number, exp: number) => {
    const buf = Buffer.alloc(4);
      buf.writeUInt32LE(input);
      const arg = new Argument(buf, buf.length);

      expect(arg.asInt()).toBe(exp);
  });

  const testDataStr = [
    [ 'A', 65 ],
    [ '\x41', 65 ],
    [ '\x87\x93n\x04', 74355591 ],
    [ '\x87\x93\x6e\x04', 74355591 ],
    [ '\x9e\x01', 256 + 158 ],
    [ '[\xec\xcb\x03', 63695963 ],
  ];
  test.each(testDataStr)('as string %#', (inputRow, exp) => {
    const input: string = inputRow as string;

    const buf = Buffer.alloc(8);
    buf.write(input, 0, input.length, 'binary');

    const arg = new Argument(buf, buf.length);
    expect(arg.asInt()).toBe(exp);
  });
});
