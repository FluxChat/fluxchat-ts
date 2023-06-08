
(() => {
  const array1: Array<Array<string | number>> = [['a', 2], ['b', 4]];

  const x = array1.reduce((acc: Map<string, number>, cur, idx, ar) => {
    console.log('row', acc, cur, idx, ar);
    acc.set(cur[0] as string, cur[1] as number);
    return acc;
  }, new Map<string, number>());

  console.log(x);
})();
