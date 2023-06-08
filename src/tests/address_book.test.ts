
import { describe, expect, jest, test, it } from '@jest/globals';
import { Client } from '../lib/client';
import { AddressBook } from '../lib/address_book';

describe('AddressBook', () => {
  test('save and load', () => {
    const client1 = new Client('uuid1');
    client1.address = 'address1';
    client1.port = 1234;

    const client2 = new Client('uuid2');
    client2.address = 'address2';
    client2.port = 5678;

    const addressbook1 = new AddressBook('tmp/tests/address_book.json');
    addressbook1.addClient(client1);
    addressbook1.addClient(client2);
    addressbook1.save();

    const addressbook2 = new AddressBook('tmp/tests/address_book.json');
    addressbook2.load();

    expect(typeof addressbook2.getAll).toEqual('function');
    expect(typeof addressbook2.getAll()).toEqual('object');
    // console.log(addressbook2.getAll());
    expect(addressbook2.getAll().size).toEqual(2);

    const client0: Client | null = addressbook2.get('uuid0');
    expect(client0).toBeNull();

    const client1b: Client | null = addressbook2.get('uuid1');
    expect(client1b).not.toBeNull();
    if (client1b) {
      expect(client1b.address).toEqual('address1');
      expect(client1b.port).toEqual(1234);
    }

    const client2b: Client | null = addressbook2.get('uuid2');
    expect(client2b).not.toBeNull();
    if (client2b) {
      expect(client2b.address).toEqual('address2');
      expect(client2b.port).toEqual(5678);
    }
  });

  test('bootstrap', async () => {
    const addressbook1 = new AddressBook('tmp/tests/address_book.json');
    await addressbook1.loadBootstrap('resources/tests/bootstrap.json', false);
    addressbook1.save();
    expect(addressbook1.getAll().size).toEqual(2);
  });
});
