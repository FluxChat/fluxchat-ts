
import * as tls from 'tls';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from './client';

export interface Config {
  readonly address: string;
  readonly port: number;
  readonly contact: string;
  readonly id: string;
  readonly data_dir: string;
};

export class Server {
  private readonly _privateKeyFilePath: string;
  private readonly _certificateFilePath: string;
  private readonly _addressbookFilePath: string;

  private _main_server: tls.Server | null = null;
  private _clients: Array<Client> = [];

  constructor(
    private readonly _config: Config,
  ) {
    console.log('-> Server');
    console.log(_config);
    console.log(typeof _config);

    this._privateKeyFilePath = path.join(this._config.data_dir, 'private_key.pem');
    this._certificateFilePath = path.join(this._config.data_dir, 'certificate.pem');
    this._addressbookFilePath = path.join(this._config.data_dir, 'address_book.json');
  }

  public start(): void {
    console.log('-> Server.start()');

    const options = {
      key: [{
        pem: fs.readFileSync(this._privateKeyFilePath),
        passphrase: process.env.FLUXCHAT_KEY_PASSWORD || 'password',
      }],
      cert: fs.readFileSync(this._certificateFilePath),
    };
    this._main_server = tls.createServer(options, this._onConnection);

    this._main_server.listen(this._config.port, this._config.address, this._onCreated);
    this._main_server.on('error', this._onError);
    this._main_server.on('data', this._onData);
  }

  private _onCreated(): void {
    console.log('-> Server._onCreated()');
  }

  private _onConnection(socket: tls.TLSSocket): void {
    console.log('-> Server._onConnection()');
    console.log('-> socket', socket);
    console.log('-> socket.remoteAddress', socket.remoteAddress);
    console.log('-> socket.remotePort', socket.remotePort);
    console.log('-> socket.authorized', socket.authorized);
    console.log('-> socket.authorizationError', socket.authorizationError);
    console.log('-> socket.encrypted', socket.encrypted);
    console.log('-> socket.getCipher()', socket.getCipher());

    const client = new Client(socket);
    this._clients.push(client);
  }

  private _onError(error: Error): void {
    console.error(error);

    if (this._main_server)
      this._main_server.close();
  }

  private _onData(data: Buffer): void {
    console.log('-> Server._onData()');
    console.log('-> data', data);
  }
}
