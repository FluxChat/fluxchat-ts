
type Contact = 'public' | 'private';

interface Config {
  readonly contact: Contact;
};

const obj1: Config = {
  contact: process.argv[2] as Contact,
  // contact: '1.2',
};
console.log(obj1);

function test1(obj: Contact): void {
  console.log(obj);
}

console.log(typeof obj1.contact);
test1(obj1.contact);

console.log(process.argv);
console.log(process.argv.slice(2));
