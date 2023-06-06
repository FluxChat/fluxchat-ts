import { Command } from '../src/lib/network';
import { Server } from '../src/lib/server';

// const command = new Command(3, 4, ['A']);

class TestServer extends Server {
  public parseRaw(data: Buffer): Array<Command> {
    return this._parseRaw(data);
  }
  public serializeCommand(command: Command): Buffer {
    return this._serializeCommand(command);
  }
}

const testServer = new TestServer({
  address: '',
  port: 0,
  contact: '',
  id: '',
  data_dir: '',
  challenge: {
    min: 0,
    max: 0,
  },
  log: {
    level: '',
    file: '',
  },
});
const b = Buffer.from([0, 3, 4, 3, 0, 0, 0, 2, 65, 66, 0]);
const command = testServer.parseRaw(b);
console.log(command);
