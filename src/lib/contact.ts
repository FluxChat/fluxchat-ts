import { LookupAddress, lookup } from 'dns';
import { isIPv4, isIPv6 } from 'net';

async function dnsLookup(hostname: string): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('dnsLookup', hostname);

    lookup(hostname, {all: true}, (err, addresses: LookupAddress[]) => {
      console.log('addresses', hostname, addresses);

      if(err) {
        reject(err);
      } else {
        if (addresses === undefined) {
          reject(new Error('No addresses found (undefined)'));
        } else if (addresses.length === 0) {
          reject(new Error('No addresses found (len 0)'));
        } else {
          resolve(addresses[0].address);
        }
      }
    });
 });
};

export class Contact {
  addr: string | null = null;
  port: number | null = null;
  is_valid: boolean = false;

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
      contact.addr = items[0];
      contact.port = null;
    } else if (items.length === 2) {
      contact.addr = items[0];
      if (items[1] === '') {
        contact.port = null;
      } else {
        contact.port = parseInt(items[1]);
      }
    } else if (items.length > 2) {
      // IPv6 address with port
      contact.addr = items.slice(0, items.length - 1).join(':');
      contact.port = parseInt(items[items.length - 1]);

      console.log('IPv6', contact.addr, contact.port);
    }

    if (contact.addr === '') {
      contact.addr = 'private';
    }

    if (contact.addr === 'public') {
      contact.addr = raddr;
    } else if (contact.addr === 'private') {
      contact.addr = null;
      contact.port = null;
    } else if (contact.addr !== null) {
      if (isIPv4(contact.addr)) {
        // Addr is IPv4 address, we can use it directly.
        if (contact.addr.slice(0, 4) === '127.') {
          contact.addr = null;
        }
      } else if (isIPv6(contact.addr)) {
        // Addr is IPv6 address, we can use it directly.
        if (contact.addr == '::' || contact.addr == '::1') {
          contact.addr = null;
        }
      } else {
        // Addr is host, we have to resolve it.
        try {
          const address: string = await dnsLookup(contact.addr);
          if (isIPv4(address)) {
            if (address.slice(0, 4) === '127.' || address == '::1') {
              contact.addr = null;
            }
          }
        } catch (error) {
          contact.addr = null;
        }
      }
    } else {
      contact.addr = null;
    }

    contact.is_valid = contact.addr !== null && contact.port !== null;
    return contact;
  }
}
