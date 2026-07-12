import winston from 'winston';
import { env } from '../../config/env';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const prodFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  return JSON.stringify({
    timestamp,
    level,
    message: stack || message,
    ...meta,
  });
});

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        env.NODE_ENV === 'development' ? colorize() : winston.format.uncolorize(),
        env.NODE_ENV === 'development' ? devFormat : prodFormat
      ),
    }),
  ],
  // Don't exit on uncaught exceptions — let the error handler deal with it
  exitOnError: false,
});

export default logger;
