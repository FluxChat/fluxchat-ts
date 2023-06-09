
import { describe, expect, test } from '@jest/globals';
import { Cash } from '../lib/cash';

describe('Cash', () => {
  test('str', () => {
    const cash = new Cash(Buffer.from('test1'), 1);
    expect(cash.toString()).toBe('Cash(1)');
  });

  test('mine', () => {
    const cash = new Cash(Buffer.from('test1'), 1);
    const cycles = cash.mine();
    expect(cycles).toBeGreaterThan(0);
    expect(cycles).toBeLessThan(10);
  });

  test('verify', () => {
    const testData = [
      {
        data: 'test1',
        bits: 24,
        proof: '000000b3b274d58f99bc290bf89160b7460e92c8efbb8b049dd66899e92a33b4',
        nonce: 66156319,
        verified: true,
      },
      {
        data: 'test1',
        bits: 10,
        proof: '0000004388017c0c014e79067c32585f6bfa11be3a7b525f2512529c773ecf61',
        nonce: 58067403,
        verified: false,
      },
      {
        data: 'test1',
        bits: 20,
        proof: '236ec5266d857b1372618e86eeb33c9850a01f73ea767ff5e656650cb11d555a',
        nonce: 1234,
        verified: false,
      },
      {
        data: 'test1',
        bits: 20,
        proof: 'xyz',
        nonce: 1234,
        verified: false,
      },
      {
        data: '8b21b089-6499-4fc9-afbf-31dfe10162da',
        bits: 15,
        proof: '000124217c6d5b57a20531ad8ed1364c1e897ea094e9ee812f7ffdf20d295a71',
        nonce: 72941053,
        verified: true,
      },
    ];

    for (const test of testData) {
      const cash = new Cash(Buffer.from(test.data), test.bits);
      const verified = cash.verify(test.proof, test.nonce);

      expect(verified).toBe(test.verified);
    }
  });
});
