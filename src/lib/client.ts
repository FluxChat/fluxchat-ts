
import { format as f } from 'util';
import { TLSSocket } from 'tls';
import { randomUUID } from 'crypto';
import { Logger } from 'winston';
import { LoggerFactory } from './logger';
import { Serializable } from './database';
import { Node } from './overlay';

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
  public nonce: string | null = null;
}

export enum ConnectionMode {
  Disconnected,
  Connected,
  Authenticated,
}

export enum Direction {
  Inbound,
  Outbound,
}

interface JsonClient {
  address?: string;
  port?: number;
}

export interface BaseClient {
  uuid: string;
}

export interface ConnectedClient extends BaseClient {
  socket: TLSSocket;
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

  // Auth
  public auth: number = 0;

  public actions: Array<Action> = [];
  public challenge: Challenge | null = null;

  private readonly _logger: Logger;
  public socket: TLSSocket | null = null;

  constructor(uuid: string | null = null) {
    this.uuid = uuid || randomUUID();

    this._logger = LoggerFactory.getInstance().createLogger('client');
    this._logger.info(f('constructor(%s)', this.uuid));
  }

  public toString(): string {
    return f('Client(%s)', this.uuid);
  }

  public toJSON(): object {
    return {
      // uuid: this.uuid,
      address: this.address,
      port: this.port,
    };
  }

  fromJSON(data: object, key: string): void {
    this._logger.info(f('fromJSON(%s)', key));
    const _mapped = data as JsonClient;

    this.uuid = key;
    this.address = _mapped.address;
    this.port = _mapped.port;
  }
}
