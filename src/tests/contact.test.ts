
import {describe, expect, jest, test, it} from '@jest/globals';
import { Contact } from '../lib/contact';

interface TestData {
  addr: string | null;
  port: number | null;
  is_valid: boolean;
}

describe('Contact', () => {
  test('resolve', async () => {
    const data: [string, string | null, [string | null, number | null, boolean]][] = [
      ['', null,            [null, null, false]],
      ['', '192.168.10.10', [null, null, false]],
      ['public', null,            [null, null, false]],
      ['public', '192.168.10.10', ['192.168.10.10', null, false]],
      ['public:', null,            [null, null, false]],
      ['public:', '192.168.10.10', ['192.168.10.10', null, false]],
      ['public:25001', null,            [null, 25001, false]],
      ['public:25001', '192.168.10.10', ['192.168.10.10', 25001, true]],
      ['192.168.10.10', null,            ['192.168.10.10', null, false]],
      ['192.168.10.10', '192.168.10.20', ['192.168.10.10', null, false]],
      ['192.168.10.10:25001', null,            ['192.168.10.10', 25001, true]],
      ['192.168.10.10:25001', '192.168.10.20', ['192.168.10.10', 25001, true]],

      ['localhost.fluxchat.dev:25001', '192.168.10.20', [null, 25001, false]],
      ['lan-host.fluxchat.dev:25001', '192.168.10.20', ['lan-host.fluxchat.dev', 25001, true]],
      ['non-resolvable.fluxchat.dev:25001', '192.168.10.20', [null, 25001, false]],

      ['localhost.fluxchat.dev:25001', null, [null, 25001, false]],
      ['lan-host.fluxchat.dev:25001', null, ['lan-host.fluxchat.dev', 25001, true]],
      ['non-resolvable.fluxchat.dev:25001', null, [null, 25001, false]],
    ];

    expect.assertions(3*data.length);
    for (const [contact_s, raddr, expect_a] of data) {
      const expected: TestData = {
        addr: expect_a[0],
        port: expect_a[1],
        is_valid: expect_a[2],
      };

      const actual = await Contact.resolve(contact_s, raddr);
      expect(actual.addr).toEqual(expected.addr);
      expect(actual.port).toEqual(expected.port);
      expect(actual.is_valid).toEqual(expected.is_valid);
    }
  });
});
