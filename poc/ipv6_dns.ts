import { LookupAddress, lookup as l } from 'dns';

function ipv6cb(err: any, addresses: LookupAddress[]) {
  console.log('addresses', addresses);
}

(() => {
  const hostname = 'localhost.fluxchat.dev';
  l(hostname, {all: true}, ipv6cb);
})();
