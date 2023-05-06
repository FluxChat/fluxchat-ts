
function demo(): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    // resolve(123);
    reject(456);
  });
}

class PromisePoc {
  public async run(): Promise<void> {
    console.log('-> run()');
    await demo()
      .then(function(success): void {
        console.log('success', success);
      })
      .catch(function(error): void {
        console.log('error', error);
      });
        console.log('-> run() end');
    }
}

const pp = new PromisePoc();
pp.run();
