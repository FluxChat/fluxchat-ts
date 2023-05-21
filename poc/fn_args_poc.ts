function test1b(...args: any[]) {
  console.log(args);
}

function test2b(...args: number[]) {
  console.log(args);
}

test1b('123', 123, {a: 1});
test1b();

test2b(1, 2, 3);
