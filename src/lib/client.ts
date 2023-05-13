
import * as tls from 'tls';
import * as winston from 'winston';
import * as crypto from 'crypto';
import { format as f } from 'util';
import { LoggerFactory } from './logger';
import { Serializable } from './database';

export interface ClientData {
  // readonly uuid: string;
  address?: string;
  port?: number;
}

export class Client implements Serializable, ClientData {
  public uuid: string;
  public address?: string;
  public port?: number;

  private readonly _logger: winston.Logger;
  public socket: tls.TLSSocket | null = null;

  // constructor() {
  constructor(uuid: string | null = null) {
    this.uuid = uuid || crypto.randomUUID();
    // this.uuid = crypto.randomUUID();

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
    const _mapped = data as ClientData;

    this.uuid = key;
    this.address = _mapped.address;
    this.port = _mapped.port;
  }
}
