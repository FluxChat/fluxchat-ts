
import { format as f } from 'util';
import { TLSSocket } from 'tls';
import { randomUUID } from 'crypto';
import { Logger } from 'winston';
import { LoggerFactory } from './logger';
import { Serializable } from './database';

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
  // TODO: node
  public conn_mode: ConnectionMode = ConnectionMode.Disconnected;
  public conn_msg: string | null = null;

  public auth: number = 0;

  // TODO: actions
  // TODO: challenge

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
