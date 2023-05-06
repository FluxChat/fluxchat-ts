import * as dns from 'dns';
import * as net from 'net';

async function dnsLookup(domain: string): Promise<string> {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, (err, address: string, family) => {
      if(err) reject(err);
      console.log('address', address, typeof address);
      resolve(address);
    });
 });
};

export class Contact {
  addr: string | null = null;
  port: number | null = null;
  is_valid: boolean = false;

  constructor() {}

  static async resolve(raw: string, raddr: string | null = null): Promise<Contact> {
    const contact = new Contact();

    const items = raw.split(':');

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
      if (net.isIPv4(contact.addr)) {
        // Addr is IP address, we can use it directly.
        if (contact.addr.slice(0, 4) === '127.') {
          contact.addr = null;
        }
      } else {
        // Addr is host, we have to resolve it.
        try {
          // console.log('DNS lookup', contact.addr);
          const address: string = await dnsLookup(contact.addr);
          // console.log('address', address);
          if (net.isIPv4(address)) {
            if (address.slice(0, 4) === '127.') {
              contact.addr = null;
            }
          }
          // console.log('DNS lookup Done');
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
