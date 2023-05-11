
import * as fs from 'fs';
import * as winston from 'winston';
import { LoggerFactory } from './logger';

type KeyType = string | number;
export type DataType<K extends KeyType, T> = { [key in K]: T };

export abstract class Database<K extends KeyType, T extends object> {
  protected abstract readonly _logger: winston.Logger;
  protected readonly _filePath: string | null = null;
  protected abstract _data: DataType<K, T>;
  protected _changed: boolean = false;

  // constructor() {
  //   this._logger = LoggerFactory.getInstance().createLogger('database');
  // }

  public load(defaultData: DataType<K, T> = {} as DataType<K, T>): void {
    this._logger.debug('load()');

    if (this._filePath === null) {
      this._data = defaultData;
      return;
    }

    if (fs.existsSync(this._filePath)) {
      this._data = JSON.parse(fs.readFileSync(this._filePath, 'utf8'));
      this._changed = false;
    } else {
      this._data = defaultData;
      this._changed = true;
    }
  }

  public save(): void {
    this._logger.debug('save()', this._changed);
    if (!this._changed) {
      return;
    }
    if (this._filePath === null) {
      return;
    }
    fs.writeFileSync(this._filePath, JSON.stringify(this._data));
    this._changed = false;
  }

  public add(key: K, value: T): void {
    this._logger.debug('add()', key, value);
    this._data[key] = value;
  }
}
