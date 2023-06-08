
const minimist = require('minimist');
import { join as pjoin } from 'path';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { Logger } from 'winston';
import { LoggerFactory } from '../lib/logger';
import { App } from '../lib/app';
import { Config } from '../lib/config';
import { Server } from '../lib/server';

class ServerApp extends App {
  private readonly _logger: Logger;
  private readonly _server: Server;
  private readonly _pidFile: string;

  constructor(
    protected readonly _args: any,
  ) {
    super(_args);

    process.on('SIGINT', this._shutdown.bind(this));
    process.on('SIGTERM', this._shutdown.bind(this));

    // Read the configuration file
    const config: Config = JSON.parse(readFileSync(_args.config, 'utf8'));

    // PID file
    this._pidFile = pjoin(config.data_dir, 'server.pid');
    writeFileSync(this._pidFile, process.pid.toString());

    LoggerFactory.init(config, _args.loglevel);
    this._logger = LoggerFactory.getInstance().createLogger('server_app');
    this._logger.info('ServerApp()');

    this._server = new Server(config);
  }

  public run(): void {
    this._logger.info('run()');
    this._server.start();
  }

  private _shutdown(): void {
    this._logger.info('_shutdown()')

    this._server.shutdown('SIGINT');
    this._cleanup();
  }

  private _cleanup(): void {
    this._logger.info('_cleanup()');

    process.removeAllListeners('SIGINT');
    process.removeAllListeners('SIGTERM');

    unlinkSync(this._pidFile);
  }
}

function main(): void {
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
}
main();
