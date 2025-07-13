// lib/logger.ts
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
import { ipAddress } from "@vercel/functions";
import { type NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import winston from "winston";

// ANSI color codes for rich terminal output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  underline: "\x1b[4m",
};

// Color mapping for log levels
const levelColors = {
  error: colors.red + colors.bold,
  warn: colors.yellow + colors.bold,
  info: colors.cyan + colors.bold,
  debug: colors.magenta + colors.bold,
  http: colors.green + colors.bold,
};

// Initialize Logtail
const logtail =
  process.env.LOGTAIL_SOURCE_TOKEN && process.env.LOGTAIL_INGESTING_HOST
    ? new Logtail(process.env.LOGTAIL_SOURCE_TOKEN, {
        endpoint: process.env.LOGTAIL_INGESTING_HOST,
      })
    : null;

// Environment detection
const isVercel = process.env.VERCEL === "1";
const isProduction = process.env.NODE_ENV === "production";

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
  level: isProduction ? "info" : "debug",
  defaultMeta: {
    service: process.env.APP_NAME || "app",
    environment: process.env.NODE_ENV || "development",
  },
  format: winston.format.combine(
    winston.format.timestamp({ format: "ISO8601" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    ...(logtail && isProduction ? [new LogtailTransport(logtail)] : []),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: "ISO8601" }),
        winston.format.errors({ stack: true }),
        winston.format.printf(
          ({ timestamp, level, message, correlationId, stack, ...meta }) => {
            // Get color for current log level
            const levelColor =
              levelColors[level as keyof typeof levelColors] || colors.white;
            const messageColor = levelColor.replace(colors.bold, "");

            // Create colored components
            const coloredTimestamp = `${colors.gray}${timestamp}${colors.reset}`;
            const coloredCorrelationId = `${colors.blue}${correlationId || "no-id"}${colors.reset}`;
            const coloredLevel = `${levelColor}${level.toUpperCase()}${colors.reset}`;
            const coloredMessage = `${messageColor}${message}${colors.reset}`;

            // Format stack traces with colors
            let stackTrace = "";
            if (stack) {
              stackTrace = `\n${colors.red}${stack}${colors.reset}`;
            }

            // Format meta data
            let metaString = "";
            const filteredMeta = Object.keys(meta).reduce(
              (acc, key) => {
                if (key !== "stack") {
                  acc[key] = meta[key];
                }
                return acc;
              },
              {} as Record<string, unknown>
            );

            if (Object.keys(filteredMeta).length) {
              metaString = `\n${colors.gray}${JSON.stringify(filteredMeta, null, 2)}${colors.reset}`;
            }

            return `${coloredTimestamp} [${coloredCorrelationId}] ${coloredLevel}: ${coloredMessage}${stackTrace}${metaString}`;
          }
        )
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
  return logger.child({ correlationId });
}

// Enhanced request error logging
function logRequestError(
  err: Error & { statusCode?: number },
  req: NextRequest,
  correlationId?: string
) {
  const clientIp =
    req.headers.get("x-client-ip") ||
    ipAddress(req) ||
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "Unknown IP";
  const meta: AppLogMeta = {
    statusCode: err.statusCode,
    path: req.nextUrl.pathname,
    clientIp,
    method: req.method,
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
      ...(err.statusCode && { statusCode: err.statusCode }),
    },
    correlationId,
  };

  const logLevel = err.statusCode && err.statusCode >= 500 ? "error" : "warn";
  logger.log(logLevel, err.message, meta);
}

// Vercel-specific cleanup
if (isVercel) {
  process.on("SIGTERM", () => {
    logger.info("Received SIGTERM - flushing logs");
    void Promise.allSettled([
      logtail?.flush(),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]).finally(() => process.exit(0));
  });
}
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  if (logtail) {
    logtail
      .flush()
      .then(() => {
        logger.info("Flushed logs before exiting");
      })
      .catch((flushErr) => {
        logger.error("Error flushing logs before exiting:", flushErr);
      });
  }
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  if (logtail) {
    logtail
      .flush()
      .then(() => {
        logger.info("Flushed logs before exiting");
      })
      .catch((flushErr) => {
        logger.error("Error flushing logs before exiting:", flushErr);
      });
  }
  process.exit(1);
});

export default logger;
export { logtail, logRequestError, createRequestLogger };
