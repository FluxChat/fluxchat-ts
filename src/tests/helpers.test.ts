
import { describe, expect, test } from '@jest/globals';
import { passwordKeyDerivation } from '../lib/helpers';

describe('Helpers', () => {
  test('password key derivation', () => {
    const pkd: string = passwordKeyDerivation('password');

    expect(pkd).toBe('Ya0zOyDI6bKMS4pBzx1V5L4dphxMIQuFWq7crk2rhX424P9A4EeXhlLwzChxWCY5wR39SWPzfrIaWcHXLB0ZAg==');
  });
});
