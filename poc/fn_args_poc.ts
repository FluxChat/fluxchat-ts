
function argsTest1b(...args: any[]) {
  console.log(args);
}

function argsTest2b(...args: number[]) {
  console.log(args);
}

(() => {
  argsTest1b('123', 123, {a: 1});
  argsTest1b();

  argsTest2b(1, 2, 3);
})();
