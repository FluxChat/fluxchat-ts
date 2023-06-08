
import { describe, expect, test } from '@jest/globals';
import { Client } from '../lib/client';

describe('Client', () => {
  test('to string', () => {
    const client = new Client('uuid1');
    client.address = 'address1';
    client.port = 1234;
    client.id = 'id1';

    expect(client.toString()).toEqual('Client(uuid1,address1:1234,ID=id1)');
  });
});
