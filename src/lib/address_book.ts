
import * as fs from 'fs';
import * as winston from 'winston';
import { format as f } from 'util';
import { LoggerFactory } from './logger';
import { Client } from './client';
import { Database } from './database';

export class AddressBook extends Database<string, Client> {
  private readonly _logger: winston.Logger;
  protected readonly _typex: new () => Client = Client;

  constructor(_filePath: string) {
    super(_filePath);

    this._logger = LoggerFactory.getInstance().createLogger('address_book');
    this._logger.debug(f('constructor(%s)', this._filePath));
  }

  public loadBootstrap(path: string): void {
    this._logger.debug(f('loadBootstrap(%s)', path));

    if (!fs.existsSync(path)) {
      return;
    }
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  }

  public addClient(client: Client): void {
    this._logger.debug(f('addClient(%s)', client));

    this.add(client.uuid, client);
  }
}
