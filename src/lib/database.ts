
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
  // protected abstract _typey: typeof T;
  // protected _typey: new () => T;

  constructor(protected readonly _filePath: string) {
    this._plogger = LoggerFactory.getInstance().createLogger('address_book');
    this._data = new Map<K, T>();
    // this._typex = function(this: T) {} as any as new () => T;
    // console.log('constructor', this._typex);
  }

  public load(defaultData: Map<K, T> = {} as Map<K, T>): void {
    this._plogger.debug('load()');

    if (fs.existsSync(this._filePath)) {
      const jsonObject = JSON.parse(fs.readFileSync(this._filePath, 'utf8'));
      const entries = Object.entries(jsonObject);

      entries.forEach(([key, value]) => {
        console.log('load A', key, value);
        // const obj = T.prototype.fromJSON(value, key);
        // .fromJSON(value, key);

        // value is from Serializable, so use fromJSON() to create the object
        // and then set it in the map

        // const _x: new () => T = T;

        // const obj: T = new (value as T);
        const obj: T = new this._typex();
        obj.fromJSON(value as object, key);
        console.log('load Ba', obj.toString());
        console.log('load Bb', typeof obj);
        this._data.set(key as K, obj);

        // const obj2: T = value as T;
        // console.log('load Ca', obj2.toString());
        // console.log('load Cb', typeof obj2);
        // this._data.set(key as K, obj2);

        // const _o = {} as T;
        // const _obj = _o.fromJSON(value as object, key);
        console.log('load Z', this._data.get(key as K));
      });

      // this._data = JSON.parse(fs.readFileSync(this._filePath, 'utf8'));
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
      // console.log(_key);
      _map.set(_key, _val.toJSON());
    }

    const entries = Array.from(_map.entries());
    // console.log('entries', entries);
    const obj = Object.fromEntries(entries);
    // console.log('obj', obj);

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
