
interface TestInt {
  toJSON(): object;
  fromJSON(data: object): any;
};

class IntTestClass implements TestInt {
  public toJSON(): object {
    return {x: 1};
  }
  public fromJSON(data: object) {
    return 1;
  }
}

(() => {
  const test = new IntTestClass();

  console.log(test.toJSON());
  console.log(JSON.stringify(test, null, 4));
})();
