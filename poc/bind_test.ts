
class Foo {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  greet(x: string) {
    console.log(`Hello, Foo ${this.name}! ${x}`);
  }
}

class Bar {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  greet() {
    console.log(`Hello, Bar ${this.name}!`);
  }
}

const o1 = new Foo('A');
const greetFunc1 = o1.greet.bind(o1, 'B');
greetFunc1();

const o2 = new Bar('B');
const greetFunc2 = o2.greet.bind(o1);
greetFunc2();
