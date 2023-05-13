
import * as crypto from 'crypto';
import * as tls from 'tls';
import * as fs from 'fs';
import * as path from 'path';
import * as winston from 'winston';
import { format as f } from 'util';
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
  private _clients: Map<string, Client> = new Map<string, Client>();
  private _tasks: Map<string, NodeJS.Timeout> = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly _config: Config,
  ) {
    super();

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

    // Tasks
    this._tasks.set('debug_clients', setInterval(this._debugClients.bind(this), 10000));
    this._tasks.set('save', setInterval(this.save.bind(this), 60000));
    this._tasks.set('contact_address_book', setTimeout(this._contactAddressBook.bind(this), 10000));

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
    this._main_server = tls.createServer(options, this._onMainServerConnection.bind(this));

    this._main_server.listen(this._config.port, this._config.address, this._onMainServerListen.bind(this));
    this._main_server.on('close', this._onMainServerClose.bind(this));
    this._main_server.on('error', this._onMainServerError.bind(this));
    this._main_server.on('drop', this._onMainServerDrop.bind(this));
  }

  public save(): void {
    this._logger.info('save()');

    if (this._addressbook) {
      this._addressbook.save();
    }
  }

  public shutdown(reason: string): void {
    this._logger.info('shutdown()', reason);
    this._shutdown = true;

    this._logger.info('shutdown tasks');
    for (let [name, task] of this._tasks) {
      this._logger.debug(f('task %s', name));
      clearInterval(task);
    }

    this._logger.info('shutdown clients');
    for (let [c_uuid, client] of this._clients) {
      this._logger.debug(f('client %s %s', c_uuid, client.uuid));
      client.socket?.destroy();
    }

    if (this._main_server) {
      this._logger.info('shutdown TLS server');
      this._main_server.close();
      this._main_server = null;
    }
  }

  private _onMainServerListen(): void {
    this._logger.debug('_onListen()');
  }

  private _onMainServerConnection(socket: tls.TLSSocket): void {
    this._logger.info('_onConnection()');

    this._logger.debug(f('socket.address %s', socket.address()));
    this._logger.debug(f('socket.authorized %s', socket.authorized));
    this._logger.debug(f('socket.authorizationError %s', socket.authorizationError));
    this._logger.debug(f('socket.encrypted %s', socket.encrypted));
    this._logger.debug(f('socket.getCipher() %s', socket.getCipher()));
    this._logger.debug(f('socket.remoteAddress %s:%d', socket.remoteAddress, socket.remotePort));
    this._logger.debug(f('socket.localAddress %s:%d', socket.localAddress, socket.localPort));

    let client = new Client();
    client.socket = socket;
    client.socket.on('data', this._onClientData.bind(this));
    client.socket.on('end', this._onClientEnd.bind(this, client));
    client.socket.on('close', this._onClientClose.bind(this));
    client.socket.on('error', this._onClientError.bind(this));
    client.socket.on('timeout', this._onClientTimeout.bind(this));
    this._clients.set(client.uuid, client);
  }

  private _onMainServerClose(): void {
    this._logger.debug('_onMainServerClose()');
  }

  private _onMainServerError(error: Error): void {
    this._logger.error(f('_onMainServerError() %s', error.message));
  }

  private _onMainServerDrop(socket: any): void {
    this._logger.debug(f('_onMainServerDrop(%s) %s:%d', typeof socket, socket.remoteAddress, socket.remotePort));
  }

  private _onClientData(data: Buffer): void {
    this._logger.debug(f('_onClientData(%s)', data.toString()));
  }

  private _onClientEnd(client: Client): void {
    this._logger.debug(f('_onClientEnd(%s)', client.uuid));
  }

  private _onClientClose(hadError: boolean): void {
    this._logger.debug(f('_onClientClose(%s)', hadError));
  }

  private _onClientError(error: Error): void {
    this._logger.error(f('_onClientError(%s)', error.message));
  }

  private _onClientTimeout(socket: tls.TLSSocket): void {
    this._logger.warn(f('_onClientTimeout(%s)', typeof socket));
  }

  private _debugClients(): void {
    this._logger.info('_debugClients()');
    for (let [c_uuid, client] of this._clients) {
      this._logger.debug(f('client %s %s', c_uuid, client.uuid));
    }
  }

  private _contactAddressBook(): void {
    this._logger.info('_contactAddressBook()');

    if (!this._addressbook) {
      return;
    }

    const _entries = this._addressbook.getAll();
    this._logger.info(f('address book has %d entries', _entries.size));
    this._logger.info(f('_entries: %s', typeof _entries));
    this._logger.info(f('getAll: %s', typeof this._addressbook.getAll));

    for (let [c_uuid, client] of _entries) {
      if (client.socket) {
        client.socket.write('contact_address_book\n');
      }
    }
  }
}
