
class BindFoo {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  greet(x: string) {
    console.log(`Hello, Foo ${this.name}! x=${x}`);
  }
}

class BindBar {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  greet() {
    console.log(`Hello, Bar ${this.name}!`);
  }
}

function bind1(o: any) {
  console.log('bind1', o);
  // console.log('bind1', this);
}

(() => {
  const o1 = new BindFoo('A');
  const greetFunc1 = o1.greet.bind(o1, 'B');
  greetFunc1();

  const o2 = new BindBar('B');
  const greetFunc2 = o2.greet.bind(o1);
  greetFunc2();

  const greetFunc3 = bind1.bind(o2);
  greetFunc3(123);
})();
