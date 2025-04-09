// lib/logger.ts
import {Logtail} from '@logtail/node';
import {LogtailTransport} from '@logtail/winston';
import {ipAddress} from '@vercel/functions';
import {type NextRequest} from 'next/server';
import {v4 as uuidv4} from 'uuid';
import winston from 'winston';

// Initialize Logtail
const logtail =
  process.env.LOGTAIL_SOURCE_TOKEN && process.env.LOGTAIL_INGESTING_HOST
    ? new Logtail(process.env.LOGTAIL_SOURCE_TOKEN, {
        endpoint: process.env.LOGTAIL_INGESTING_HOST,
      })
    : null;
// Environment detection
const isVercel = process.env.VERCEL === '1';
const isProduction = process.env.NODE_ENV === 'production';

interface AppLogMeta {
  statusCode?: number;
  path?: string;
  clientIp?: string;
  method?: string;
  error?: Error;
  correlationId?: string;
  [key: string]: unknown;
}

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  defaultMeta: {
    service: process.env.APP_NAME || 'app',
    environment: process.env.NODE_ENV || 'development',
  },
  format: winston.format.combine(
    winston.format.timestamp({format: 'ISO8601'}),
    winston.format.errors({stack: true}),
    winston.format.json(),
  ),
  transports: [
    ...(logtail && isProduction ? [new LogtailTransport(logtail)] : []),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({format: 'ISO8601'}), // Add this
        winston.format.errors({stack: true}), // Add this
        winston.format.colorize(),
        winston.format.printf(({timestamp, level, message, correlationId, ...meta}) => {
          return `[${timestamp}] [${correlationId || 'no-id'}] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        }),
      ),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.Console(),
    ...(logtail && isProduction ? [new LogtailTransport(logtail)] : []),
  ],
  rejectionHandlers: [
    new winston.transports.Console(),
    ...(logtail && isProduction ? [new LogtailTransport(logtail)] : []),
  ],
});

// Add correlation ID support
function createRequestLogger(correlationId: string = uuidv4()) {
  return logger.child({correlationId});
}

// Enhanced request error logging
function logRequestError(
  err: Error & {statusCode?: number},
  req: NextRequest,
  correlationId?: string,
) {
  const clientIp =
    req.headers.get('x-client-ip') ||
    ipAddress(req) ||
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'Unknown IP';
  const meta: AppLogMeta = {
    statusCode: err.statusCode,
    path: req.nextUrl.pathname,
    clientIp,
    method: req.method,
    // error: err,
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
      ...(err.statusCode && {statusCode: err.statusCode}),
    },
    correlationId,
  };

  const logLevel = err.statusCode && err.statusCode >= 500 ? 'error' : 'warn';
  // const log = (req as any).logger || logger;
  // log.log(logLevel, err.message, meta);
  logger.log(logLevel, err.message, meta);
}

// Vercel-specific cleanup
if (isVercel) {
  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM - flushing logs');
    void Promise.allSettled([
      logtail?.flush(),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]).finally(() => process.exit(0));
  });
}
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // logtail?.error(err);
  // Flush logs before exiting
  if (logtail) {
    logtail
      .flush()
      .then(() => {
        logger.info('Flushed logs before exiting');
      })
      .catch((flushErr) => {
        logger.error('Error flushing logs before exiting:', flushErr);
      });
  }
  // Exit the process
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // logtail?.error(reason);
  // Flush logs before exiting
  if (logtail) {
    logtail
      .flush()
      .then(() => {
        logger.info('Flushed logs before exiting');
      })
      .catch((flushErr) => {
        logger.error('Error flushing logs before exiting:', flushErr);
      });
  }
  // Exit the process
  process.exit(1);
});

export default logger;
export {logtail, logRequestError, createRequestLogger};
