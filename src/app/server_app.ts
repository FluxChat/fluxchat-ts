
const minimist = require('minimist');
import * as fs from 'fs';
import * as winston from 'winston';
import { App } from '../lib/app';
import { Config, Server } from '../lib/server';

class ServerApp extends App {
  private readonly _logger: winston.Logger;
  private readonly _server: Server;

  constructor(
    protected readonly _args: any,
  ) {
    super(_args);

    console.log('-> ServerApp');

    process.on('SIGINT', this._onSigInt.bind(this));

    // Read the configuration file
    const config: Config = JSON.parse(fs.readFileSync(_args.config, 'utf8'));
    console.log(config);

    this._server = new Server(config);
  }

  public run(): void {
    console.log('-> ServerApp.run()');
    this._server.start();
    console.log('-> ServerApp.run() end');
  }

  private _onSigInt(): void {
    console.log();
    console.log('-> ServerApp._onSigInt()');
    this._server.shutdown('SIGINT');
    console.log('-> ServerApp._onSigInt() end');
  }
}
const options = {
  string: ['config', 'loglevel'],
  alias: {
    config: ['c'],
    loglevel: ['l'],
  },
  boolean: ['dev'],
  default: {
    config: 'var/config1.json',
    loglevel: 'warn',
  },
};
const args = minimist(process.argv.slice(2), options);

const app: ServerApp = new ServerApp(args);
app.run();
