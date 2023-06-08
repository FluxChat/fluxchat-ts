
import { describe, expect, jest, test, it } from '@jest/globals';
import { Contact } from '../lib/contact';
import { isIPv6Enabled } from '../lib/network';

interface TestData {
  addr: string | null;
  port: number | null;
  is_valid: boolean;
}

type TestArray = Array<[string, string | null, [string | null, number | null, boolean]]>;

async function runTestData(data: TestArray): Promise<void> {
  expect.assertions(3 * data.length);
  for (const [contact_s, raddr, expect_a] of data) {
    const expected: TestData = {
      addr: expect_a[0],
      port: expect_a[1],
      is_valid: expect_a[2],
    };

    const actual = await Contact.resolve(contact_s, raddr);

    expect(actual.address).toEqual(expected.addr);
    expect(actual.port).toEqual(expected.port);
    expect(actual.is_valid).toEqual(expected.is_valid);
  }
}

describe('Contact', () => {
  test('resolve_ipv4', async () => {
    const data: TestArray = [
      // IPv4
      ['', null,            [null, null, false]],
      ['', '192.168.10.10', [null, null, false]],

      ['private', null, [null, null, false]],

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

    await runTestData(data);
  });

  if (isIPv6Enabled()) {
    test('resolve_ipv6', async () => {
      const data: TestArray = [
        // IPv6
        ['2001:db8::1:25001', '2001:db8::2', ['2001:db8::1', 25001, true]],
        ['[2001:db8::1]:25001', '2001:db8::2', ['2001:db8::1', 25001, true]],

        ['test.ipv6.fluxchat.dev:25001', '2001:db8::2', ['test.ipv6.fluxchat.dev', 25001, true]],

        ['non-resolvable.ipv6.fluxchat.dev:25001', '2001:db8::2', [null, 25001, false]],
      ];

      await runTestData(data);
    });
  }
});
