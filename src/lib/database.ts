
import * as fs from 'fs';
import * as winston from 'winston';
import { format as f } from 'util';
import { LoggerFactory } from './logger';

type KeyType = string | number;

export interface Serializable {
  toJSON(): object;
  fromJSON(data: object, key?: any): void;
};

export abstract class Database<K extends KeyType, T extends Serializable> {
  private readonly _plogger: winston.Logger;
  protected _data: Map<K, T>;
  protected _changed: boolean = false;
  protected abstract readonly _typex: new () => T;

  constructor(protected readonly _filePath: string) {
    this._plogger = LoggerFactory.getInstance().createLogger('address_book');
    this._data = new Map<K, T>();
  }

  public load(defaultData: Map<K, T> = new Map<K, T>()): void {
    this._plogger.debug('load()');

    if (fs.existsSync(this._filePath)) {
      const jsonObject = JSON.parse(fs.readFileSync(this._filePath, 'utf8'));
      const entries = Object.entries(jsonObject);

      entries.forEach(([key, value]) => {
        // console.log('load A', key, value);

        const obj: T = new this._typex();
        obj.fromJSON(value as object, key);
        // console.log('load Ba', obj.toString());
        // console.log('load Bb', typeof obj);
        this._data.set(key as K, obj);
        // console.log('load Z', this._data.get(key as K));
      });

      this._plogger.debug(f('load() - %s', this._data));
      this._changed = false;
    } else {
      this._data = defaultData;
      this._changed = true;
    }
  }

  public save(): void {
    this._plogger.debug('save()', this._changed);
    if (!this._changed) {
      return;
    }

    const _map = new Map<K, object>();
    for (const [_key, _val] of this._data.entries()) {
      _map.set(_key, _val.toJSON());
    }

    const entries = Array.from(_map.entries());
    const obj = Object.fromEntries(entries);

    fs.writeFileSync(this._filePath, JSON.stringify(obj, null, 4));

    this._changed = false;
  }

  public add(key: K, value: T): void {
    this._plogger.debug(f('add(%s, %s)', key, value));
    this._data.set(key, value);
    this._changed = true;
  }

  public remove(key: K): void {
    this._plogger.debug(f('remove(%s)', key));

    this._data.delete(key);
    this._changed = true;
  }

  public get(key: K): T | null {
    this._plogger.debug(f('get(%s)', key));

    if (this._data.has(key)) {
      return this._data.get(key) as T;
    }
    return null;
  }

  public getAll(): Map<K, T> {
    this._plogger.debug('getAll()');
    return this._data;
  }
}
