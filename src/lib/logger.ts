
import * as path from 'path';
import * as winston from 'winston';
import { Config } from './config';
import { Format } from 'logform';

type LogLevel = string | undefined;
type LogFormat = Format;

export class LoggerFactory {
  private static instance: LoggerFactory;

  public static init(config: Config, addlogLevel: LogLevel = undefined): void {
    let logFile: string = config.log.file;
    if (!logFile.startsWith('/') && !logFile.includes('/')) {
      logFile = path.join(config.data_dir, logFile);
    }
    // console.log('logFile', logFile);

    let effectiveLogLevel: LogLevel = addlogLevel === undefined ? config.log.level : addlogLevel;
    // console.log('effectiveLogLevel', effectiveLogLevel);

    const format = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ssZ' }),
      winston.format.printf((info) => `${info.timestamp} ${process.pid} ${info.level.toUpperCase()} ${info.label} ${info.message}`)
    );

    LoggerFactory.instance = new LoggerFactory(logFile, effectiveLogLevel, format);
  }

  public static getInstance(): LoggerFactory {
    return LoggerFactory.instance;
  }

  private constructor(
    private readonly _logFile: string,
    private readonly _logLevel: LogLevel,
    private _format: LogFormat,
  ) {
  }

  public createLogger(name: string): winston.Logger {
    const transports: winston.transport[] = [
      new winston.transports.Console({
      }),
      new winston.transports.File({
        filename: this._logFile,
      }),
    ];

    const format = winston.format.combine(
      winston.format.label({ label: name }),
      this._format,
    );

    return winston.createLogger({
      level: this._logLevel,
      format: format,
      transports: transports,
    });
  }
}
