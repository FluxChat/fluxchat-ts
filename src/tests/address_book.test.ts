
import { describe, expect, test } from '@jest/globals';
import { encode as b58enc } from 'bs58';
import { Client } from '../lib/client';
import { AddressBook } from '../lib/address_book';
import { Node } from '../lib/overlay';

describe('AddressBook', () => {
  const PATH = 'tmp/tests/address_book.json';

  test('save and load', () => {
    const client1 = new Client('uuid1');
    client1.address = 'address1';
    client1.port = 1234;

    const client2 = new Client('uuid2');
    client2.address = 'address2';
    client2.port = 5678;

    const addressbook1 = new AddressBook(PATH);
    addressbook1.addClient(client1);
    addressbook1.addClient(client2);
    addressbook1.save();

    const addressbook2 = new AddressBook(PATH);
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
    const addressbook1 = new AddressBook(PATH);
    await addressbook1.loadBootstrap('resources/tests/bootstrap.json', false);
    addressbook1.save();
    expect(addressbook1.getAll().size).toEqual(2);
  });

  test.each([
    {
      nodeId: '00000000000000000000000000000000',
      limit: 3,
      exp: [
        'FC_4F7BsTMVPKFshM1MwLf6y23cid6fL3xMpazVoF9ksKxs', // 0100
        'FC_4F7BsTMVPKFshM1MwLf6y23cid6fL3xMpazVoF9ksfSo', // 0200
        'FC_4F7BsTMVPKFshM1MwLf6y23cid6fL3xMpazVoF9kszvj', // 0300
      ],
    },
    {
      nodeId: '00000000000000000000000000000210',
      limit: 3,
      exp: [
        'FC_4F7BsTMVPKFshM1MwLf6y23cid6fL3xMpazVoF9ksfSo', // 0200
        'FC_4F7BsTMVPKFshM1MwLf6y23cid6fL3xMpazVoF9kszvj', // 0300
        'FC_4F7BsTMVPKFshM1MwLf6y23cid6fL3xMpazVoF9ksKxs', // 0100
      ],
    },
    {
      nodeId: '00000000000000000000000000000210',
      limit: 2,
      exp: [
        'FC_4F7BsTMVPKFshM1MwLf6y23cid6fL3xMpazVoF9ksfSo', // 0200
        'FC_4F7BsTMVPKFshM1MwLf6y23cid6fL3xMpazVoF9kszvj', // 0300
      ],
    },
    {
      nodeId: '00000000000000000000000000000200',
      limit: 3,
      exp: [
        'FC_4F7BsTMVPKFshM1MwLf6y23cid6fL3xMpazVoF9ksfSo', // 0200
        'FC_4F7BsTMVPKFshM1MwLf6y23cid6fL3xMpazVoF9kszvj', // 0300
        'FC_4F7BsTMVPKFshM1MwLf6y23cid6fL3xMpazVoF9ksKxs', // 0100
      ],
    },
    {
      nodeId: '00000000000000000000000000001000',
      limit: 3,
      exp: [
        'FC_4F7BsTMVPKFshM1MwLf6y23cid6fL3xMpazVoF9ksKxs', // 0100
        'FC_4F7BsTMVPKFshM1MwLf6y23cid6fL3xMpazVoF9ksfSo', // 0200
        'FC_4F7BsTMVPKFshM1MwLf6y23cid6fL3xMpazVoF9kszvj', // 0300
      ],
    },
  ])('get nearest to #$# $nodeId', ({nodeId, limit, exp}) => {
    // 0100
    const client1 = new Client('node1');
    client1.node = new Node('FC_4F7BsTMVPKFshM1MwLf6y23cid6fL3xMpazVoF9ksKxs');

    // 0200
    const client2 = new Client('node2');
    client2.node = new Node('FC_4F7BsTMVPKFshM1MwLf6y23cid6fL3xMpazVoF9ksfSo');

    // 0300
    const client3 = new Client('node3');
    client3.node = new Node('FC_4F7BsTMVPKFshM1MwLf6y23cid6fL3xMpazVoF9kszvj');

    const addressBook = new AddressBook(PATH);
    addressBook.addClient(client1);
    addressBook.addClient(client2);
    addressBook.addClient(client3);

    const nodeIdB58 = b58enc(Buffer.from(nodeId));

    const node = new Node(`FC_${nodeIdB58}`);
    const nearests = addressBook.getNearestTo(node, null, limit);
    const nearestsIds = nearests.map((c: Client) => c.node?.id);

    expect(nearests).not.toBeNull();
    expect(nearests.length).toEqual(limit);
    expect(nearestsIds).toEqual(exp);
  });
});
