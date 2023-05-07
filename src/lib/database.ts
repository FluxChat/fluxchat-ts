
import * as fs from 'fs';

export abstract class Database {
  protected readonly _filePath: string | null = null;
  protected _data: any = {};
  protected _changed: boolean = false;

  public load(defaultData: any = {}) {
    console.log('-> Database.load()');

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

  public save() {
    console.log('-> Database.save()', this._changed);
    if (!this._changed) {
      return;
    }
    this._changed = false;
  }
}
