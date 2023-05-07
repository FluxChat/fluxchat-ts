
const minimist = require('minimist');
import * as fs from 'fs';
import { Config, Server } from '../lib/server';

class ServerApp {
  private readonly _server: Server;

  constructor(
    private readonly _args: any,
  ) {
    console.log('-> Server');
    console.log(_args);

    // Read the configuration file
    const config: Config = JSON.parse(fs.readFileSync(_args.config, 'utf8'));
    console.log(config);

    this._server = new Server(config);
  }

  public run(): void {
    console.log('-> run()');

    this._server.start();
  }
}
const options = {
  string: ['config'],
  alias: {
    config: ['c'],
  },
  default: {
    config: 'var/config1.json',
  },
};
const args = minimist(process.argv.slice(2), options);

const app: ServerApp = new ServerApp(args);
app.run();
