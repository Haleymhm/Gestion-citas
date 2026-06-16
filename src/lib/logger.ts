import pino from 'pino';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const isDevelopment = process.env.NODE_ENV === 'development';

const pinoLogger = pino({
  level: isDevelopment ? 'debug' : 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

const winstonLogger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      dirname: process.env.LOG_FILE_PATH || './logs',
    }),
  ],
});

export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      pinoLogger.debug({ msg: message, args });
    } else {
      winstonLogger.debug(message, ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      pinoLogger.info({ msg: message, args });
    } else {
      winstonLogger.info(message, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      pinoLogger.warn({ msg: message, args });
    } else {
      winstonLogger.warn(message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      pinoLogger.error({ msg: message, args });
    } else {
      winstonLogger.error(message, ...args);
    }
  },
};

export default logger;