
import {
  TLSSocket,
  connect as tlsConnect,
  Server as TLSServer,
  createServer as createTlsServer,
} from 'tls';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { join as pjoin } from 'path';
import { Logger } from 'winston';
import { LoggerFactory } from './logger';
import { format as f } from 'util';
import { passwordKeyDerivation } from './helpers';
import { Config } from './config';
import { Command, Network } from './network';
import { AddressBook } from './address_book';
import { AuthLevel, ConnectionMode, Direction, Client, ConnectedClient } from './client';
import { Cash } from './cash';
import { Contact } from './contact';
import { cli } from 'winston/lib/winston/config';

const VERSION = 1;

export class Server extends Network {
  private _shutdown: boolean = false;
  private readonly _logger: Logger;
  private _privateKeyDerivation: string | null = null;
  private readonly _privateKeyFilePath: string;
  private readonly _publicKeyFilePath: string;
  private readonly _certificateFilePath: string;
  private readonly _addressbookFilePath: string;
  private readonly _addressbookBootstrapFilePath: string;

  private _addressbook: AddressBook;
  private _main_server: TLSServer | null = null;
  private _clients: Map<string, ConnectedClient> = new Map<string, ConnectedClient>();
  private _tasks: Map<string, NodeJS.Timeout> = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly _config: Config,
  ) {
    super();

    this._logger = LoggerFactory.getInstance().createLogger('server');

    this._privateKeyFilePath = pjoin(this._config.data_dir, 'private_key.pem');
    this._publicKeyFilePath = pjoin(this._config.data_dir, 'public_key.pem');

    this._certificateFilePath = pjoin(this._config.data_dir, 'certificate.pem');
    this._logger.debug('certificate file path', this._certificateFilePath);

    this._addressbookFilePath = pjoin(this._config.data_dir, 'address_book.json');
    this._logger.debug('address book file path', this._addressbookFilePath);
    this._addressbookBootstrapFilePath = pjoin(this._config.data_dir, 'bootstrap.json');
    this._addressbook = new AddressBook(this._addressbookFilePath);
  }

  public start(): void {
    this._logger.info('start()');

    this._logger.debug('password key derivation start');
    this._privateKeyDerivation = passwordKeyDerivation(process.env.FLUXCHAT_KEY_PASSWORD || 'password');
    this._logger.debug('password key derivation done');

    // Tasks
    this._tasks.set('debug_clients', setInterval(this._debugClients.bind(this), 10000));
    this._tasks.set('handle_clients', setInterval(this._handleClients.bind(this), 300));
    this._tasks.set('ping_clients', setInterval(this._pingClients.bind(this), 60000));
    this._tasks.set('save', setInterval(this.save.bind(this), 60000));
    this._tasks.set('contact_address_book', setTimeout(this._contactAddressBook.bind(this), 10000));

    // Address Book
    this._addressbook.load();
    this._addressbook.loadBootstrap(this._addressbookBootstrapFilePath);

    // Main TLS Server
    this._logger.info('start TLS server');
    const options = {
      key: [{
        pem: readFileSync(this._privateKeyFilePath),
        passphrase: this._privateKeyDerivation,
      }],
      cert: readFileSync(this._certificateFilePath),
    };
    this._main_server = createTlsServer(options, this._onMainServerConnection.bind(this));

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
      this._logger.debug(f('client %s', client.uuid));
      client.socket.destroy();
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

  private _onMainServerConnection(socket: TLSSocket): void {
    this._logger.info('_onConnection()');

    this._logger.debug(f('address %s', socket.address()));
    this._logger.debug(f('authorized %s', socket.authorized));
    this._logger.debug(f('authorizationError %s', socket.authorizationError));
    this._logger.debug(f('encrypted %s', socket.encrypted));
    this._logger.debug(f('getCipher() %s', socket.getCipher()));
    this._logger.debug(f('remoteAddress %s:%d', socket.remoteAddress, socket.remotePort));
    this._logger.debug(f('localAddress %s:%d', socket.localAddress, socket.localPort));

    const client = new Client();
    const connectedClient = client as ConnectedClient;

    client.conn_mode = ConnectionMode.Connected;
    client.socket = socket;
    client.socket.on('ready', this._onClientReady.bind(this, client));
    client.socket.on('data', this._onClientData.bind(this, connectedClient));
    client.socket.on('end', this._onClientEnd.bind(this, client));
    client.socket.on('close', this._onClientClose.bind(this, client));
    client.socket.on('error', this._onClientError.bind(this, client));
    client.socket.on('timeout', this._onClientTimeout.bind(this, client));

    this._clients.set(client.uuid, connectedClient);
  }

  private _onMainServerClose(): void {
    this._logger.debug('_onMainServerClose()');
  }

  private _onMainServerError(error: Error): void {
    this._logger.error(f('_onMainServerError() %s', error.message));
    this.shutdown(error.message);
  }

  private _onMainServerDrop(socket: any): void {
    this._logger.debug(f('_onMainServerDrop(%s) %s:%d', typeof socket, socket.remoteAddress, socket.remotePort));
  }

  private _onClientConnect(client: Client): void {
    this._logger.debug(f('_onClientConnect(%s)', client.uuid));
  }

  private _onClientReady(client: Client): void {
    this._logger.debug(f('_onClientReady(%s)', client));

    client.conn_mode = ConnectionMode.Connected;
  }

  private _onClientData(client: ConnectedClient, data: Buffer): void {
    this._logger.debug(f('_onClientData(%s)', client));
    this._logger.debug(f('data: %d', data.length));

    const commands: Array<Command> = this._parseRaw(data);
    for (let command of commands) {
      this._logger.debug(f('command: %s', command));
      this._clientHandleCommand(client, command);
    }
  }

  private _onClientEnd(client: Client): void {
    this._logger.debug(f('_onClientEnd(%s)', client));

    this._clients.delete(client.uuid);
    client.reset();
  }

  private _onClientClose(client: Client, hadError: boolean): void {
    this._logger.debug(f('_onClientClose(%s, %s)', client, hadError));

    this._clients.delete(client.uuid);
    client.reset();
  }

  private _onClientError(client: Client, error: Error): void {
    this._logger.error(f('_onClientError(%s, %s)', client, error.message));
  }

  private _onClientTimeout(client: Client, socket: TLSSocket): void {
    this._logger.warn(f('_onClientTimeout(%s, %s)', client, typeof socket));
  }

  private _debugClients(): void {
    this._logger.info(f('_debugClients() -> %d', this._clients.size));
    for (let [c_uuid, client] of this._clients) {
      this._logger.debug(f('debug client %s', c_uuid));
    }
  }

  private _handleClients(): void {
    // this._logger.info('_handleClients()');

    for (let [c_uuid, client] of this._clients) {
      // this._logger.debug(f('handle client %s', c_uuid));

      switch (client.conn_mode) {
        case ConnectionMode.Disconnected:
          this._logger.debug(f('handle client %s, disconnected: %s', c_uuid, client.conn_msg));

          this._clients.delete(client.uuid);
          client.socket?.destroy();
          client.reset();
          break;

        case ConnectionMode.Connecting:
          this._logger.debug(f('handle client %s, connecting', c_uuid));
          break;

        case ConnectionMode.Connected:
          this._logger.debug(f('handle client, auth: %d', client.auth));

          if ((client.auth & AuthLevel.SentChallenge) == 0) {
            this._logger.debug(f('send CHALLENGE to client %s', c_uuid));

            const challenge = randomUUID();
            const challenge_b = Buffer.from(challenge, 'utf8');
            client.cash = new Cash(challenge_b, this._config.challenge.min);

            this._clientSendChallenge(client, challenge);
            client.auth |= AuthLevel.SentChallenge;
          }

          else if ((client.auth & AuthLevel.ReceivedChallenge) != 0 && (client.auth & AuthLevel.SentId) == 0) {
            this._logger.debug(f('send ID to client %s', c_uuid));

            if (client.challenge.proof !== null && client.challenge.nonce !== null) {
              this._clientSendId(client, client.challenge.proof, client.challenge.nonce);
            }

            client.auth |= AuthLevel.SentId;
          }

          else if (client.auth == AuthLevel.Authenticated) {
            this._logger.debug(f('client %s, authenticated', c_uuid));

            client.conn_mode = ConnectionMode.Authenticated;
          }

          // TODO: check for timeout

          break;

        case ConnectionMode.Authenticated:
          // this._logger.debug(f('handle client %s, authenticated', c_uuid));
          break;

        default:
          this._logger.warn(f('handle client %s, unknown connection mode %d', c_uuid, client.conn_mode));
      }
    }
  }

  private _pingClients(): void {
    this._logger.info('_pingClients()');
    for (const [c_uuid, client] of this._clients) {
      this._logger.debug(f('client %s', c_uuid));

      this._clientSendPing(client);
    }
  }

  private _contactAddressBook(): void {
    this._logger.info('_contactAddressBook()');

    this._logger.info('getAll()');
    const _entries = this._addressbook.getAll();

    this._logger.debug(f('entries %s', _entries.size));
    this._addressbook.getAll().forEach((client: Client, key: string) => {
      if (!client.socket) {
        this._logger.debug(f('client %s, socket is null', client.uuid));
        this._clientConnect(client);
      }
    });
  }

  private _clientConnect(client: Client): void {
    this._logger.info('_clientConnect()');
    const options = {
      host: client.address,
      port: client.port,
      rejectUnauthorized: false,
    };

    const connectedClient = client as ConnectedClient;

    client.conn_mode = ConnectionMode.Connecting;
    client.dir_mode = Direction.Outbound;

    client.socket = tlsConnect(options, this._onClientConnect.bind(this, client));
    client.socket.on('ready', this._onClientReady.bind(this, client));
    client.socket.on('data', this._onClientData.bind(this, connectedClient));
    client.socket.on('end', this._onClientEnd.bind(this, client));
    client.socket.on('close', this._onClientClose.bind(this, client));
    client.socket.on('error', this._onClientError.bind(this, client));
    client.socket.on('timeout', this._onClientTimeout.bind(this, client));

    this._clients.set(client.uuid, connectedClient);
  }

  protected _clientHandleCommand(client: ConnectedClient, command: Command): void {
    this._logger.debug(f('_clientHandleCommand(%s, %s)', client, command));

    if (command.group >= 2 && client.auth != AuthLevel.Authenticated) {
      this._logger.warn(f('client %s not authenticated', client.uuid));
      client.conn_mode = ConnectionMode.Disconnected;
      client.conn_msg = 'not authenticated';
      return;
    }

    switch (command.group) {
      case 0: // Basic
        switch (command.command) {
          case 0: // OK
            this._logger.debug(f('OK command'));
            break;

          default:
            this._logger.warn(f('unknown command %d:%d', command.group, command.command));
            break;
        }
        break;

      case 1: // Connection, Authentication, etc
        switch (command.command) {
          case 1: // CHALLENGE command
            this._logger.debug(f('CHALLENGE command: %s', command.args.toString()));

            if ((client.auth & AuthLevel.ReceivedChallenge) != 0) {
              this._logger.warn(f('client %s already authenticated', client.uuid));
              break;
            }

            client.auth |= AuthLevel.ReceivedChallenge;

            client.challenge.min = command.asInt(0);
            client.challenge.max = command.asInt(1);
            client.challenge.data = command.asString(2);
            console.log(client.challenge);

            if (client.challenge.data.length > 36) {
              this._logger.warn(f('client %s challenge data too long', client.uuid));
              client.conn_mode = ConnectionMode.Disconnected;
              client.conn_msg = 'challenge data too long';
              break;
            }

            if (client.challenge.min > this._config.challenge.max) {
              this._logger.warn(f('client %s challenge min too long: %d > %d', client.uuid, client.challenge.min, this._config.challenge.max));
              client.conn_mode = ConnectionMode.Disconnected;
              client.conn_msg = 'challenge min is too big';
            }

            const challengeData = Buffer.from(client.challenge.data);
            const cash = new Cash(challengeData, client.challenge.min);

            this._logger.debug(f('mine cash: %s', cash));
            const cycles = cash.mine();
            this._logger.debug(f('mine done: %d', cycles));
            this._logger.debug(f('proof: %s', cash.proof));
            this._logger.debug(f('nonce: %s', cash.nonce));

            client.challenge.proof = cash.proof;
            client.challenge.nonce = cash.nonce;

            break;

          case 2: // ID command
            this._logger.debug(f('ID command'));

            if ((client.auth & AuthLevel.ReceivedChallenge) == 0) {
              this._logger.warn(f('client %s not received challenge', client.uuid));
              break;
            }

            if ((client.auth & AuthLevel.ReceivedId) != 0) {
              this._logger.warn(f('client %s already authenticated', client.uuid));
              break;
            }

            const cVersion = command.asInt(0);
            const cId = command.asString(1);
            const cContact = command.asString(2);
            const cProof = command.asString(3);
            const cNonce = command.asInt(4);

            this._logger.debug(f('client version: %s', cVersion));
            this._logger.debug(f('client id: %s', cId));
            this._logger.debug(f('client contact: %s', cContact));
            this._logger.debug(f('client proof: %s', cProof));
            this._logger.debug(f('client nonce: %s', cNonce));

            // TODO check Local Node

            if (VERSION != cVersion) {
              this._logger.warn(f('client %s version mismatch: %s != %s', client.uuid, VERSION, cVersion));
              client.conn_mode = ConnectionMode.Disconnected;
              client.conn_msg = 'version mismatch';
              break;
            }

            if (client.cash === null) {
              this._logger.warn(f('client %s cash is null', client.uuid));
              client.conn_mode = ConnectionMode.Disconnected;
              client.conn_msg = 'cash is null';
              break;
            }
            if (!client.cash.verify(cProof, cNonce)) {
              this._logger.warn(f('client %s cash verify failed', client.uuid));
              client.conn_mode = ConnectionMode.Disconnected;
              client.conn_msg = 'cash verify failed';
              break;
            }

            // Contact
            const contact = Contact.resolve(cContact);

            switch (client.dir_mode) {
              case Direction.Inbound:
                this._logger.debug(f('client %s, inbound', client.uuid));
                break;

              case Direction.Outbound:
                this._logger.debug(f('client %s, outbound', client.uuid));
                break;
            }

            client.auth |= AuthLevel.ReceivedId;

            break;

          case 3: // PING command
            this._logger.debug(f('PING command'));
            this._clientSendPong(client);
            break;

          case 4: // PONG command
            this._logger.debug(f('PONG command'));
            break;
        }
        break;

      case 2: // Overlay, Address Book, Routing, etc
        switch (command.command) {
          case 1: // GET_NEAREST_TO command
            this._logger.debug(f('GET_NEAREST_TO command'));
            break;

          case 2: // GET_NEAREST_TO RESPONSE command
            this._logger.debug(f('GET_NEAREST_TO RESPONSE command'));
            break;

          case 3: // REQUEST PUBLIC KEY FOR NODE command
            this._logger.debug(f('REQUEST PUBLIC KEY FOR NODE command'));
            break;

          case 4: // RESPONSE PUBLIC KEY FOR NODE command
            this._logger.debug(f('RESPONSE PUBLIC KEY FOR NODE command'));
            break;
        }
        break;

      case 3: // Mail
        switch (command.command) {
          case 1: // SEND MAIL command
            this._logger.debug(f('SEND MAIL command'));
            break;
        }
        break;

      default:
        this._logger.warn(f('unknown command %d:%d', command.group, command.command));
        break;
    }
  }

  private _clientSendCommand(client: ConnectedClient, command: Command): void {
    this._logger.debug(f('_clientSendCommand(%s, %s)', client.uuid, command));

    const data = this._serializeCommand(command);
    this._logger.debug(f('data', data));
    this._logger.debug(f('data hex: %s', data.toString('hex')));
    this._logger.debug(f('data str: "%s"', data.toString()));

    this._logger.debug(f('write socket: %d', data.length));
    client.socket.write(data);
  }

  private _clientSendOk(client: ConnectedClient): void {
    this._logger.debug(f('_clientSendOk(%s)', client));

    const command = new Command(0, 0);
    this._clientSendCommand(client, command);
  }

  private _clientSendChallenge(client: ConnectedClient, challenge: string): void {
    this._logger.debug(f('_clientSendChallenge(%s, %s)', client, challenge));

    const command = new Command(1, 1, [
      this._config.challenge.min,
      this._config.challenge.max,
      challenge,
    ]);
    this._clientSendCommand(client, command);
  }

  private _clientSendId(client: ConnectedClient, proof: string, nonce: number): void {
    this._logger.debug(f('_clientSendId(%s, %s, %d)', client, proof, nonce));

    const command = new Command(1, 2, [
      VERSION,
      this._config.id,
      this._config.contact,
      proof,
      nonce,
    ]);
    this._clientSendCommand(client, command);
  }

  private _clientSendPing(client: ConnectedClient): void {
    this._logger.debug(f('_clientSendPing(%s)', client));

    const command = new Command(1, 3);
    this._clientSendCommand(client, command);
  }

  private _clientSendPong(client: ConnectedClient): void {
    this._logger.debug(f('_clientSendPong(%s)', client));

    const command = new Command(1, 4);
    this._clientSendCommand(client, command);
  }
}
