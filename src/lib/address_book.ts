
import * as fs from 'fs';
import { Client } from './client';
import { DataType, Database } from './database';

export class AddressBook extends Database<string, Client> {
  protected _data: DataType<string, Client>;

  constructor(protected readonly _filePath: string) {
    super();
    this._data = {};
    console.log('-> AddressBook.constructor()', this._filePath);
  }

  public loadBootstrap(path: string): void {
    console.log('-> AddressBook.loadBootstrap()', path);
    if (!fs.existsSync(path)) {
      return;
    }
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  }
}
