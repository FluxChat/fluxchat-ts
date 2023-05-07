
import * as tls from 'tls';

export class Client {
  constructor(
    private readonly _socket: tls.TLSSocket,
  ) {
    console.log('-> Client');
    console.log(_socket);
    console.log(typeof _socket);
  }
}
