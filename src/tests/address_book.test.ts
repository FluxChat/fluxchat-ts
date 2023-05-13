
import {describe, expect, jest, test, it} from '@jest/globals';
import { Client } from '../lib/client';
import { AddressBook } from '../lib/address_book';

describe('AddressBook', () => {
  test('basics', () => {
    const client1 = new Client('uuid1');
    client1.address = 'address1';
    client1.port = 1234;
    expect(client1.toString()).toEqual('Client(uuid1)');

    const client2 = new Client('uuid2');
    client2.address = 'address2';
    client2.port = 5678;

    const ad1 = new AddressBook('tmp/tests/address_book.json');
    ad1.addClient(client1);
    ad1.addClient(client2);
    ad1.save();

    const ad2 = new AddressBook('tmp/tests/address_book.json');
    ad2.load();
    expect(typeof ad2.getAll).toEqual('function');
    expect(typeof ad2.getAll()).toEqual('object');
    // console.log(ad2.getAll());
    expect(ad2.getAll().size).toEqual(2);

    const client1b: Client | null = ad2.get('uuid1');
    expect(client1b).not.toBeNull();
    if (client1b) {
      expect(client1b.toString()).toEqual('Client(uuid1)');
    }
  });

  test('bootstrap', async () => {
    const ad1 = new AddressBook('tmp/tests/address_book.json');
    await ad1.loadBootstrap('tmp/tests/bootstrap.json');
  });
});
