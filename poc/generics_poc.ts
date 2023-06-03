
import { readFileSync, writeFileSync, existsSync } from 'fs';

class Client {
  private readonly _uuid: string = '1234567890';
  constructor(
    public readonly name: string,
  ) {
    console.log('-> Client.constructor()', name);
  }
}

type KeyType = string | number;
type DataType<K extends KeyType, T> = { [key in K]: T };

abstract class Database<K extends KeyType, T extends object> {
  protected readonly _filePath: string | null = null;
  // protected _data: { [key: KeyType]: T } = {};
  // protected _data: { [key in K]: T };
  protected abstract _data: DataType<K, T>;
  // protected _data: OptionsFlags<K, T> = {};

  constructor() {
    console.log('-> Database.constructor()');
    // this._data = {} as DataType<K, T>;
  }

  public load(defaultData: DataType<K, T> = {} as DataType<K, T>) {
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

class AddressBook extends Database<string, Client> {
  protected _data: DataType<string, Client>;

  constructor(
    protected readonly _filePath: string | null,
  ) {
    super();
    // this._data = {} as DataType<string, Client>;
    this._data = {};
    console.log('-> AddressBook.constructor()', this._filePath);
  }
}

const client = new Client('client');
const addressBook = new AddressBook('tmp/address_book.json');
addressBook.load();
addressBook.save();

addressBook.add('client', client);

addressBook.save();
