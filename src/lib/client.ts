
import { format as f } from 'util';
import { TLSSocket } from 'tls';
import { randomUUID } from 'crypto';
import { Logger } from 'winston';
import { LoggerFactory } from './logger';
import { Serializable } from './database';
import { Node } from './overlay';
import { Cash } from './cash';

class Action {
  public id: string | null = null;
  public subid: string | null = null;
  public is_strong: boolean = false;
  public valid_until: Date | null = null;
  public func: any = null;

  public equals(other: Action): boolean {
    return  this.id === other.id && this.subid === other.subid;
  }
}

class Challenge {
  public min: number | null = null;
  public max: number | null = null;
  public data: string | null = null;
  public proof: string | null = null;
  public nonce: number | null = null;
}

export enum ConnectionMode {
  Disconnected,
  Connecting,
  Connected,
  Authenticated,
}

export enum Direction {
  Unknown,
  Inbound,
  Outbound,
}

export enum AuthLevel {
  NotAuthenticated = 0,
  SentChallenge = 1,
  ReceivedChallenge = 2,
  SentId = 4,
  ReceivedId = 8,
  Authenticated = 15,
}

interface JsonClient {
  address?: string;
  port?: number;
  id?: string;
  seen_at?: Date;
  meetings?: number;
  is_bootstrap?: boolean;
  is_trusted?: boolean;
  debug_add?: string;
}

interface BaseClient {
  uuid: string;
}

export interface ConnectedClient extends BaseClient {
  conn_mode: ConnectionMode;
  conn_msg: string;
  dir_mode: Direction;
  auth: AuthLevel;
  cash: Cash | null;
  challenge: Challenge;
  socket: TLSSocket;
  reset(): void;
}

export class Client implements Serializable, JsonClient, BaseClient {
  public uuid: string;
  public address?: string;
  public port?: number;
  public id?: string;
  public seen_at?: Date;
  public meetings?: number;
  public is_bootstrap?: boolean;
  public is_trusted?: boolean;
  public debug_add?: string;

  // Unmapped
  public node: Node | null = null;

  // Connection
  public conn_mode: ConnectionMode = ConnectionMode.Disconnected;
  public conn_msg: string | null = null;

  // Direction
  public dir_mode: Direction = Direction.Unknown;

  // Auth
  public auth: number = AuthLevel.NotAuthenticated;

  public actions: Array<Action> = [];
  public challenge: Challenge;
  public cash: Cash | null = null;

  private readonly _logger: Logger;
  public socket: TLSSocket | null = null;

  constructor(uuid: string | null = null) {
    this.uuid = uuid || randomUUID();
    this.challenge = new Challenge();

    this._logger = LoggerFactory.getInstance().createLogger('client');
    this._logger.info(f('constructor(%s)', this.uuid));
  }

  public toString(): string {
    return f('Client(%s)', this.uuid);
  }

  public toJSON(): object {
    this._logger.info(f('toJSON(%s)', this.uuid));

    return {
      address: this.address,
      port: this.port,
      id: this.id,
      seen_at: this.seen_at,
      meetings: this.meetings,
      is_bootstrap: this.is_bootstrap,
      is_trusted: this.is_trusted,
      debug_add: this.debug_add,
    };
  }

  public fromJSON(data: object, key: string): void {
    this._logger.info(f('fromJSON(%s)', key));

    const _mapped = data as JsonClient;

    this.uuid = key;
    this.address = _mapped.address;
    this.port = _mapped.port;
    this.id = _mapped.id;
    this.seen_at = _mapped.seen_at;
    this.meetings = _mapped.meetings;
    this.is_bootstrap = _mapped.is_bootstrap;
    this.is_trusted = _mapped.is_trusted;
    this.debug_add = _mapped.debug_add;
  }

  public reset(): void {
    this._logger.info(f('reset(%s)', this.uuid));

    this.conn_mode = ConnectionMode.Disconnected;
    this.conn_msg = null;
    this.auth = AuthLevel.NotAuthenticated;
    this.actions = [];
    this.challenge = new Challenge();
    this.cash = null;
  }

  public hasContact(): boolean {
    return this.address !== undefined && this.port !== undefined;
  }
}
