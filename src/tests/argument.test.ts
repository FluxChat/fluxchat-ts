
import { describe, expect, jest, test, it } from '@jest/globals';
import { Argument } from '../lib/network';

describe('Argument', () => {
  test('asInt', () => {
    const testData = [
      {
        test: 65,
        expected: 65,
      },
      {
        test: 256 * 256,
        expected: 65536,
      },
      {
        test: '\x41',
        expected: 65,
      },
    ];

    for (const data of testData) {
      const arg = new Argument(data.test);

      expect(arg.asInt()).toBe(data.expected);
    }
  });

  test('asBytes', () => {
    const testData = [
      {
        test: 65,
        expected: {
          data: [65, 0, 0, 0],
          length: 4,
        },
      },
      {
        test: 256 * 256,
        expected: {
          data: [0, 0, 1, 0],
          length: 4,
        },
      },
      {
        test: 68344739,
        expected: {
          data: [0xA3, 0xDB, 0x12, 0x04],
          length: 4,
        },
      },
      {
        test: 'A',
        expected: {
          data: [65],
          length: 1,
        },
      },
      {
        test: 'ABCDEF',
        expected: {
          data: [65, 66, 67, 68, 69, 70],
          length: 6,
        },
      },
    ];

    for (const data of testData) {
      const arg = new Argument(data.test);
      const expData = Buffer.from(data.expected.data);

      expect(arg.asBytes()).toStrictEqual(expData);
      expect(arg.length).toBe(data.expected.length);
    }
  });
});
