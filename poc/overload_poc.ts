
class OverloadFoo {
  // myMethod(x: number, y: string): void;
  myMethod(param: string | number): void {
    // console.log('x', x);
    // console.log('y', y);
    console.log('param', param);
  }
}

const f1 = new OverloadFoo();
f1.myMethod(1);
f1.myMethod('abc');
// f1.myMethod(1);
