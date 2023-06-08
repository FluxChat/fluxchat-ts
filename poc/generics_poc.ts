
import { readFileSync, writeFileSync, existsSync } from 'fs';

class GenericClient {
  private readonly _uuid: string = '1234567890';
  constructor(
    public readonly name: string,
  ) {
    console.log('-> Client.constructor()', name);
  }
}

type GenericKeyType = string | number;
type GenericDataType<K extends GenericKeyType, T> = { [key in K]: T };

abstract class GenericDatabase<K extends GenericKeyType, T extends object> {
  protected readonly _filePath: string | null = null;
  // protected _data: { [key: GenericKeyType]: T } = {};
  // protected _data: { [key in K]: T };
  protected abstract _data: GenericDataType<K, T>;
  // protected _data: OptionsFlags<K, T> = {};

  constructor() {
    console.log('-> Database.constructor()');
    // this._data = {} as GenericDataType<K, T>;
  }

  public load(defaultData: GenericDataType<K, T> = {} as GenericDataType<K, T>) {
    console.log('-> Database.load()');
    if (this._filePath !== null && existsSync(this._filePath)) {
      const data: string = readFileSync(this._filePath, 'utf8');
      console.log('-> Database.load() data', data);
      this._data = JSON.parse(data);
    } else {
      this._data = defaultData;
    }
  }

  public save(): void {
    console.log('-> Database.save()');
    if (this._filePath === null) {
      return;
    }
    writeFileSync(this._filePath, JSON.stringify(this._data));
  }

  public add(key: K, value: T): void {
    console.log('-> Database.add()');
    this._data[key] = value;
  }
}

class GenericAddressBook extends GenericDatabase<string, GenericClient> {
  protected _data: GenericDataType<string, GenericClient>;

  constructor(
    protected readonly _filePath: string | null,
  ) {
    super();
    // this._data = {} as GenericDataType<string, GenericClient>;
    this._data = {};
    console.log('-> AddressBook.constructor()', this._filePath);
  }
}

(() => {
  const client = new GenericClient('client');

  const addressBook = new GenericAddressBook('tmp/address_book.json');
  addressBook.load();
  addressBook.save();

  addressBook.add('client', client);

  addressBook.save();
})();
