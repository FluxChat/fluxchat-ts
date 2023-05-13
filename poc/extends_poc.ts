
class ExtFoo {
  private readonly _x: number = 1;

  constructor(x: number = 0) {
    this._x = x;
    console.log('Foo', x);
  }

  public get x(): number {
    return this._x;
  }
}

class ExtBar extends ExtFoo {
  // private readonly _x: number = 2;

  constructor(x: number = 0) {
    super(x);
    console.log('Bar', x);
  }
}

const foo1 = new ExtFoo(21);
const bar1 = new ExtBar(42);
console.log('foo1', foo1);
console.log('bar1', bar1);
console.log('bar1.x', bar1.x);
