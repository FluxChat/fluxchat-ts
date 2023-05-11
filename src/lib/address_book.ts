
import * as fs from 'fs';
import * as winston from 'winston';
import { LoggerFactory } from './logger';
import { Client } from './client';
import { DataType, Database } from './database';

export class AddressBook extends Database<string, Client> {
  protected readonly _logger: winston.Logger;
  protected _data: DataType<string, Client>;

  constructor(protected readonly _filePath: string) {
    super();
    this._logger = LoggerFactory.getInstance().createLogger('address_book');
    this._data = {};
    this._logger.debug('constructor()', this._filePath);
    // console.log('-> AddressBook.constructor()', this._filePath);
  }

  public loadBootstrap(path: string): void {
    // console.log('-> AddressBook.loadBootstrap()', path);
    if (!fs.existsSync(path)) {
      return;
    }
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  }
}
