
import { describe, expect, jest, test, it } from '@jest/globals';
import { Argument } from '../lib/network';

describe('Argument', () => {
  test('as integer', () => {
    const testData = [
      [ 65, 65 ],
      [ 256 * 256, 65536 ],
      [ '\x41', 65 ],
      [ 'A', 65 ],
      [ '\x87\x93n\x04', 74355591 ],
      [ '\x87\x93\x6e\x04', 74355591 ],
      [ '\x9e\x01', 256 + 158 ],
    ];

    for (const row of testData) {
      const [ input, exp ] = row;
      const arg = new Argument(input);

      expect(arg.asInt()).toBe(exp);
    }
  });

  test('as bytes', () => {
    const testData = [
      {
        test: 65,
        exp: {
          data: [65, 0, 0, 0],
          length: 4,
        },
      },
      {
        test: 256 * 256,
        exp: {
          data: [0, 0, 1, 0],
          length: 4,
        },
      },
      {
        test: 68344739,
        exp: {
          data: [0xA3, 0xDB, 0x12, 0x04],
          length: 4,
        },
      },
      {
        test: 'A',
        exp: {
          data: [65],
          length: 1,
        },
      },
      {
        test: 'ABCDEF',
        exp: {
          data: [65, 66, 67, 68, 69, 70],
          length: 6,
        },
      },
    ];

    for (const data of testData) {
      const arg = new Argument(data.test);
      const expData = Buffer.from(data.exp.data);

      expect(arg.asBytes()).toStrictEqual(expData);
      expect(arg.length).toBe(data.exp.length);
    }
  });
});
