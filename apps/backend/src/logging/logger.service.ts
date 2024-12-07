import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file'; // Usa la importación correcta
import TransportStream, { TransportStreamOptions } from 'winston-transport';
import * as net from 'net';

interface TcpTransportOptions extends TransportStreamOptions {
  host?: string;
  port?: number;
}

class TcpTransport extends TransportStream {
  private host: string;
  private port: number;

  constructor(options: TcpTransportOptions) {
    super(options); // Pasa las opciones requeridas a la clase base
    this.host = options.host || 'localhost';
    this.port = options.port || 5044;
  }

  log(info: any, callback: () => void): void {
    setImmediate(() => this.emit('logged', info));

    const client = net.createConnection({ host: this.host, port: this.port }, () => {
      client.write(JSON.stringify(info) + '\n');
      client.end();
    });

    client.on('error', (err) => {
      console.error('Logstash connection error:', err.message);
    });

    callback();
  }
}

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
        new TcpTransport({
          host: 'localhost', // Configura el host para Logstash u otro destino
          port: 5044,        // Configura el puerto para Logstash u otro destino
        }),
      ],
    });
  }

  log(message: string) {
    this.logger.info({ message, '@timestamp': new Date().toISOString() });
  }

  error(message: string, trace: string) {
    this.logger.error({
      message,
      trace,
      '@timestamp': new Date().toISOString(),
    });
  }

  warn(message: string) {
    this.logger.warn({ message, '@timestamp': new Date().toISOString() });
  }

  debug(message: string) {
    this.logger.debug({ message, '@timestamp': new Date().toISOString() });
  }

  verbose(message: string) {
    this.logger.verbose({ message, '@timestamp': new Date().toISOString() });
  }
}
