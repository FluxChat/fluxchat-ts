
console.log(process.argv);

switch (process.argv[2]) {
  case 'a':
    console.log('a');
    break;

  case 'b':
    console.log('b');
    break;

  default:
    console.log('default');
};
