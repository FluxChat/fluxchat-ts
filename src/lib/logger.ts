
import { join as pjoin } from 'path';
import {
  Logger,
  createLogger as wcreateLogger,
  format as wformat,
  transport as wtransport,
  transports as wtransports,
} from 'winston';
import { Config } from './config';
import { Format } from 'logform';

type LogLevel = string | undefined;
type LogFormat = Format;

export class LoggerFactory {
  private static instance: LoggerFactory;

  private static _createDefaultFormat(): LogFormat {
    return wformat.combine(
      wformat.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      wformat.printf((info) => `${info.timestamp} ${process.pid} ${info.level.toUpperCase()} ${info.label} ${info.message}`)
    );
  }

  public static init(config: Config, addlogLevel: LogLevel = undefined): void {
    let logFile: string = config.log.file;
    if (!logFile.startsWith('/') && !logFile.includes('/')) {
      logFile = pjoin(config.data_dir, logFile);
    }
    let effectiveLogLevel: LogLevel = addlogLevel === undefined ? config.log.level : addlogLevel;
    const format = LoggerFactory._createDefaultFormat();
    LoggerFactory.instance = new LoggerFactory(logFile, effectiveLogLevel, format);
  }

  private static _createDefaultConsoleLogger(): void {
    const logFile: string = '/dev/null';
    const debugLevel: LogLevel = 'warn';
    const format = LoggerFactory._createDefaultFormat();
    LoggerFactory.instance = new LoggerFactory(logFile, debugLevel, format);
  }

  public static getInstance(): LoggerFactory {
    if (!LoggerFactory.instance) {
      LoggerFactory._createDefaultConsoleLogger();
    }
    return LoggerFactory.instance;
  }

  private constructor(
    private readonly _logFile: string,
    private readonly _logLevel: LogLevel,
    private _format: LogFormat,
  ) {
  }

  public createLogger(name: string): Logger {
    const transports: wtransport[] = [
      new wtransports.Console({
      }),
      new wtransports.File({
        filename: this._logFile,
      }),
    ];

    const _f = wformat.combine(
      wformat.label({ label: name }),
      this._format,
    );

    return wcreateLogger({
      level: this._logLevel,
      format: _f,
      transports: transports,
    });
  }
}
