import { LookupAddress, lookup } from 'dns';
import { isIPv4, isIPv6 } from 'net';

async function dnsLookup(hostname: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // console.log('dnsLookup', hostname);

    lookup(hostname, {all: true}, (err, addresses: LookupAddress[]) => {
      // console.log('addresses', hostname, addresses);

      if (err) {
        reject(err);
      } else if (addresses === undefined) {
        reject(new Error('No addresses found (undefined)'));
      } else if (addresses.length === 0) {
        reject(new Error('No addresses found (len 0)'));
      } else {
        resolve(addresses[0].address);
      }
    });
  });
}

export class Contact {
  public address: string | null = null;
  public port: number | null = null;
  public is_valid = false;

  static async resolve(raw: string, raddr: string | null = null): Promise<Contact> {
    const contact = new Contact();

    let items: string[];
    if (raw.includes('[') && raw.includes(']')) {
      items = raw.split(']');
      items = [
        items[0].slice(1),
        items[1].slice(1),
      ];
    }
    else {
      items = raw.split(':');
    }

    if (items.length === 1) {
      contact.address = items[0];
      contact.port = null;
    } else if (items.length === 2) {
      contact.address = items[0];
      if (items[1] === '') {
        contact.port = null;
      } else {
        contact.port = parseInt(items[1]);
      }
    } else if (items.length > 2) {
      // IPv6 address with port
      contact.address = items.slice(0, items.length - 1).join(':');
      contact.port = parseInt(items[items.length - 1]);

      console.log('IPv6', contact.address, contact.port); // TODO
    }

    if (contact.address === '') {
      contact.address = 'private';
    }

    if (contact.address === 'public') {
      contact.address = raddr;
    } else if (contact.address === 'private') {
      contact.address = null;
      contact.port = null;
    } else if (contact.address !== null) {
      if (isIPv4(contact.address)) {
        // Addr is IPv4 address, we can use it directly.
        if (contact.address.slice(0, 4) === '127.') {
          contact.address = null;
        }
      } else if (isIPv6(contact.address)) {
        // Addr is IPv6 address, we can use it directly.
        if (contact.address == '::' || contact.address == '::1') {
          contact.address = null;
        }
      } else {
        // Addr is host, we have to resolve it.
        try {
          const address: string = await dnsLookup(contact.address);
          if (isIPv4(address)) {
            if (address.slice(0, 4) === '127.' || address == '::1') {
              contact.address = null;
            }
          }
        } catch (error) {
          contact.address = null;
        }
      }
    } else {
      contact.address = null;
    }

    contact.is_valid = contact.address !== null && contact.port !== null;
    return contact;
  }
}
