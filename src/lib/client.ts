
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
  seenAt?: Date;
  usedAt?: Date;
  meetings?: number;
  isBootstrap?: boolean;
  isTrusted?: boolean;
  debugAdd?: string;
}

interface BaseClient {
  uuid: string;
}

export interface ConnectedClient extends BaseClient {
  debugAdd?: string;
  connMode: ConnectionMode;
  connMsg: string;
  dirMode: Direction;
  auth: AuthLevel;
  cash: Cash | null;
  challenge: Challenge;
  socket: TLSSocket;

  equals(other: Client): boolean
  reset(): void;
}

export class Client implements Serializable, JsonClient, BaseClient {
  public uuid: string;
  public address?: string;
  public port?: number;
  public id?: string;
  public seenAt?: Date;
  public usedAt?: Date;
  public meetings?: number;
  public isBootstrap?: boolean;
  public isTrusted?: boolean;
  public debugAdd?: string;

  // Unmapped
  public node: Node | null = null;

  // Connection
  public connMode: ConnectionMode = ConnectionMode.Disconnected;
  public connMsg: string | null = null;

  // Direction
  public dirMode: Direction = Direction.Unknown;

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
    return f('Client(%s,%s:%d,ID=%s)', this.uuid, this.address, this.port, this.id);
  }

  public toJSON(): object {
    this._logger.info(f('toJSON(%s)', this.uuid));

    return {
      address: this.address,
      port: this.port,
      id: this.id,
      seen_at: this.seenAt,
      used_at: this.usedAt,
      meetings: this.meetings,
      is_bootstrap: this.isBootstrap,
      is_trusted: this.isTrusted,
      debug_add: this.debugAdd,
    };
  }

  public fromJSON(data: object, key: string): void {
    this._logger.info(f('fromJSON(%s)', key));

    const _mapped = data as JsonClient;

    this.uuid = key;
    this.address = _mapped.address;
    this.port = _mapped.port;
    this.id = _mapped.id;
    this.seenAt = _mapped.seenAt;
    this.usedAt = _mapped.usedAt;
    this.meetings = _mapped.meetings;
    this.isBootstrap = _mapped.isBootstrap;
    this.isTrusted = _mapped.isTrusted;
    this.debugAdd = _mapped.debugAdd;
  }

  public equals(other: Client): boolean {
    return this.uuid === other.uuid;
  }

  public reset(): void {
    this._logger.info(f('reset(%s)', this.uuid));

    this.connMode = ConnectionMode.Disconnected;
    this.connMsg = null;
    this.auth = AuthLevel.NotAuthenticated;
    this.actions = [];
    this.challenge = new Challenge();
    this.cash = null;
  }

  public hasContact(): boolean {
    return this.address !== undefined && this.port !== undefined;
  }

  public refreshSeenAt(): void {
    this._logger.info(f('refreshSeenAt(%s)', this.uuid));

    this.seenAt = new Date();
  }

  public refreshUsedAt(): void {
    this._logger.info(f('refreshUsedAt(%s)', this.uuid));

    this.usedAt = new Date();
  }

  public incMeetings(): void {
    this._logger.info(f('incMeetings(%s)', this.uuid));

    this.meetings = (this.meetings || 0) + 1;
  }
}
