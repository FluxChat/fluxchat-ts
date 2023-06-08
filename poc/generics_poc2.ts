
interface Serializable {
  test(): void;
}

abstract class GenPoc2<T extends Serializable> {
  protected abstract readonly _typex: new () => T;
  constructor() {
    console.log('GenPoc2()');
  }

  public createNewInstance(): T {
    return new this._typex();
  }
}

class GenPoc2Impl extends GenPoc2<GenPocClient> {
  protected _typex: new () => GenPocClient = GenPocClient;

  constructor() {
    super();
    console.log('GenPoc2Impl()');
  }
}

class GenPocClient implements Serializable {
  constructor() {
    console.log('GenPocClient()');
  }

  test(): void {
    console.log('test()');
  }
}

(() => {
  const genPoc2 = new GenPoc2Impl();
  const genPocClient = genPoc2.createNewInstance();
  genPocClient.test();
})();
