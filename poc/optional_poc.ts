
interface TestInterface {
  readonly uuid: string;
  readonly address?: string;
  readonly name: string | undefined;
}

function optTest2(x: TestInterface): void {
  console.log(x.address === undefined);
  console.log(x.name === undefined);
  console.log(x);
}

(() => {
  const ofoo1: TestInterface = {
    uuid: 'foo',
    address: 'bar',
    name: 'foo_bar',
  };
  const ofoo2: TestInterface = {
    uuid: 'foo',
    name: undefined,
  };

  optTest2(ofoo1);
  optTest2(ofoo2);
})();
