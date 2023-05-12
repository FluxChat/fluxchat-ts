
import * as tls from 'tls';
import * as winston from 'winston';
import { LoggerFactory } from './logger';

export class Client {
  private readonly _logger: winston.Logger;

  constructor(
    private readonly _socket: tls.TLSSocket,
  ) {
    this._logger = LoggerFactory.getInstance().createLogger('client');

    this._logger.info('constructor()');
  }
}
