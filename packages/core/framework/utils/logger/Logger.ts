import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import { LogLevel } from '../../../../common/interfaces/Global';


export class Logger {
  private logger: WinstonLogger;
  private colors = {
    info: '\x1b[32m', // green
    warn: '\x1b[33m', // yellow
    error: '\x1b[31m', // red
    debug: '\x1b[36m', // cyan
    reset: '\x1b[0m', // reset
    dim: '\x1b[2m',   // gray
    white: '\x1b[37m' // white
  };
  

  constructor() {
    this.logger = this.configureLogger('development');
  }

  private configureLogger(environment: string): WinstonLogger {
    // Format personnalisé style Spring Boot
    const logFormat = format.printf(({ timestamp, level, message, ...meta }) => {
      const upperLevel = level.toUpperCase().padEnd(5);
      const date = new Date(timestamp as any).toISOString();
      
      // Format: 2024-01-22 10:15:32.123  INFO 12345 --- Message
      let logMessage: string = `${this.colors.dim} ${date}${this.colors.reset}  `;
      
      const levelColor: string = this.colors[level as LogLevel] || this.colors.white;
      logMessage += `${levelColor}${upperLevel}${this.colors.reset} `;
      
      logMessage += `${this.colors.dim}${this.colors.reset} ${this.colors.dim}---${this.colors.reset} `;
      
      logMessage += `${message}`;

      // Métadonnées si présentes
      if (Object.keys(meta).length) {
        logMessage += ` ${this.colors.dim}${JSON.stringify(meta)}${this.colors.reset}`;
      }

      return logMessage;
    });

    const loggerTransports = [
      new transports.Console({
        level: environment === 'development' ? 'debug' : 'info',
        format: format.combine(
          format.timestamp(),
          logFormat
        )
      }),
      // new transports.File({
      //   filename: path.join(__dirname, 'logs', 'application.log'),
      //   level: 'info',
      //   format: format.combine(
      //     format.timestamp(),
      //     format.json()
      //   )
      // })
    ];

    return createLogger({
      level: environment === 'production' ? 'info' : 'debug',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true })
      ),
      transports: loggerTransports
    });
  }

  public setEnvironment(environment: string): void {
    this.logger = this.configureLogger(environment);
  }

  private log(level: LogLevel, message: string, meta?: any): void {
    this.logger.log(level, message, meta || {});
  }

  public info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  public error(message: string, meta?: any): void {
    this.log('error', message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.log('debug', message, meta);
  }
}