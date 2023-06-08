
(() => {
  let x: number | null;
  if (process.argv[2] === 'a') {
    x = 1;
  } else {
    x = 2;
  }

  const y: number = x + 1;

  console.log(x, y);
})();
