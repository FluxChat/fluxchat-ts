
import * as crypto from 'crypto';
import * as tls from 'tls';
import * as fs from 'fs';
import * as path from 'path';
import * as winston from 'winston';
import { passwordKeyDerivation } from './helpers';
import { LoggerFactory } from './logger';
import { Config } from './config';
import { Network } from './network';
import { AddressBook } from './address_book';
import { Client } from './client';

export class Server extends Network {
  private _shutdown: boolean = false;
  private readonly _logger: winston.Logger;
  private readonly _privateKeyDerivation: string;
  private readonly _privateKeyFilePath: string;
  private readonly _privateKey: crypto.KeyObject;
  private readonly _publicKeyFilePath: string;
  private readonly _publicKey: crypto.KeyObject;
  private readonly _certificateFilePath: string;
  private readonly _addressbookFilePath: string;

  private _addressbook: AddressBook | null = null;
  private _main_server: tls.Server | null = null;
  private _clients: Array<Client> = [];

  constructor(
    private readonly _config: Config,
  ) {
    super();
    // console.log('-> Server');

    this._logger = LoggerFactory.getInstance().createLogger('server');

    this._logger.debug('password key derivation start');
    this._privateKeyDerivation = passwordKeyDerivation(process.env.FLUXCHAT_KEY_PASSWORD || 'password');
    this._logger.debug('password key derivation done');

    this._privateKeyFilePath = path.join(this._config.data_dir, 'private_key.pem');
    this._logger.debug('private key file path', this._privateKeyFilePath);
    this._privateKey = crypto.createPrivateKey({
      key: fs.readFileSync(this._privateKeyFilePath),
      passphrase: this._privateKeyDerivation,
    });

    this._publicKeyFilePath = path.join(this._config.data_dir, 'public_key.pem');
    this._logger.debug('public key file path', this._publicKeyFilePath);
    this._publicKey = crypto.createPublicKey(fs.readFileSync(this._publicKeyFilePath));

    this._certificateFilePath = path.join(this._config.data_dir, 'certificate.pem');
    this._logger.debug('certificate file path', this._certificateFilePath);

    this._addressbookFilePath = path.join(this._config.data_dir, 'address_book.json');
    this._logger.debug('address book file path', this._addressbookFilePath);
  }

  public start(): void {
    this._logger.info('start()');

    // Address Book
    this._addressbook = new AddressBook(this._addressbookFilePath);
    this._addressbook.load();

    // Main TLS Server
    this._logger.info('start TLS server');
    const options = {
      key: [{
        pem: fs.readFileSync(this._privateKeyFilePath),
        passphrase: this._privateKeyDerivation,
      }],
      cert: fs.readFileSync(this._certificateFilePath),
    };
    this._main_server = tls.createServer(options, this._onConnection.bind(this));

    this._main_server.listen(this._config.port, this._config.address, this._onCreated.bind(this));
    this._main_server.on('error', this._onError.bind(this));
    this._main_server.on('data', this._onData.bind(this));
  }

  public shutdown(reason: string): void {
    this._logger.info('shutdown()', reason);
    this._shutdown = true;

    if (this._main_server) {
      this._main_server.close();
    }
  }

  private _onCreated(): void {
    this._logger.debug('_onCreated()');
  }

  private _onConnection(socket: tls.TLSSocket): void {
    this._logger.info('_onConnection()');
    this._logger.debug(typeof socket);
    this._logger.debug('socket', socket);
    this._logger.debug('socket.remoteAddress', socket.remoteAddress);
    this._logger.debug('socket.remotePort', socket.remotePort);
    this._logger.debug('socket.authorized', socket.authorized);
    this._logger.debug('socket.authorizationError', socket.authorizationError);
    this._logger.debug('socket.encrypted', socket.encrypted);
    this._logger.debug('socket.getCipher()', socket.getCipher());

    const client = new Client(socket);
    this._clients.push(client);
  }

  private _onError(error: Error): void {
    this._logger.error('_onError', error);
  }

  private _onData(data: Buffer): void {
    this._logger.debug('_onData()');
  }
}
