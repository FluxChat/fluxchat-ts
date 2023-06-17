
import { EventEmitter } from 'events';

class MyEmitter extends EventEmitter {
  public test1(x: string): void {
    this.emit('test1', x);
  }
}

(() => {
  const myEmitter = new MyEmitter();

  myEmitter.on('test1', (y: string) => {
    console.log('test1', y);
  });

  myEmitter.test1('A');
  // myEmitter.off('test1');
  // myEmitter.removeAllListeners();
  myEmitter.test1('B');
})();
