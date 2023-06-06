
const unsortedArray = [42, 21, 20, 19, 87];
const sortedArray = unsortedArray.sort((a, b) => {
  console.log('a', a, 'b', b);
  if (a > 50) {
    console.log('a > 50');
    return -1000;
  }
  return a - b;
});
console.log(sortedArray);
