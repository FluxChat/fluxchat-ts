
const unfilteredArray = [42, 21, 20, 19, 87];
const fileredArray = unfilteredArray.filter((a) => {
  console.log('a', a);
  return a > 40;
});
console.log(fileredArray);
