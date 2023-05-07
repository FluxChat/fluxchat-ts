
import { Client } from "./client";
import { Database } from "./database";

export class AddressBook extends Database {
  // protected _data: { [key: string]: Client } = {};

  constructor(protected readonly _filePath: string) {
    super();
    console.log('-> AddressBook.constructor()', this._filePath);
  }
}
