import { LookupAddress, lookup as l } from 'dns';

function cb(err: any, addresses: LookupAddress[]) {
  console.log('addresses', hostname, addresses);
}

const hostname = 'localhost.fluxchat.dev';

l(hostname, {all: true}, cb);
