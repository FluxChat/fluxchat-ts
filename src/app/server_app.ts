
const minimist = require('minimist');
import * as winston from 'winston';
import * as fs from 'fs';
import { App } from '../lib/app';
import { Config } from '../lib/config';
import { LoggerFactory } from '../lib/logger';
import { Server } from '../lib/server';
import path from 'path';

class ServerApp extends App {
  private readonly _logger: winston.Logger;
  private readonly _server: Server;

  constructor(
    protected readonly _args: any,
  ) {
    super(_args);

    console.log('-> ServerApp');
    // console.log(_args);

    process.on('SIGINT', this._shutdown.bind(this));
    process.on('SIGTERM', this._shutdown.bind(this));

    // Read the configuration file
    const config: Config = JSON.parse(fs.readFileSync(_args.config, 'utf8'));
    console.log(config);

    LoggerFactory.init(config, _args.loglevel);
    this._logger = LoggerFactory.getInstance().createLogger('server_app');

    this._logger.error('My error message');
    this._logger.warn('My warning message');
    this._logger.info('My info message');

    // console.log(config);

    this._server = new Server(config);
  }

  public run(): void {
    // console.log('-> ServerApp.run()');
    this._server.start();
    // console.log('-> ServerApp.run() end');
  }

  private _shutdown(): void {
    // console.log();
    // console.log('-> ServerApp._shutdown()');
    this._server.shutdown('SIGINT');
    // console.log('-> ServerApp._shutdown() end');
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
    loglevel: undefined,
  },
};
const args = minimist(process.argv.slice(2), options);

const app: ServerApp = new ServerApp(args);
app.run();
