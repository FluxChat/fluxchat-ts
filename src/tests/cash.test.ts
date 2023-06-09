
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
      data: '08cf7f44-ab60-43d8-8e19-f31f4530be65',
      bits: 15,
      proof: '00017b469c38f93e650a3311fc28a3459b638ff5f48b527da4278689451be960',
      nonce: 71620086,
      verified: true,
    },
  ];

  test.each(testData)('verify %#', (testRow) => {
    const cash = new Cash(Buffer.from(testRow.data), testRow.bits);
    const verified = cash.verify(testRow.proof, testRow.nonce);
    expect(verified).toBe(testRow.verified);
  });
});
