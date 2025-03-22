import { type NextRequest } from "next/server";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

import { v4 as uuidv4 } from "uuid";

// Define custom log format with error typing
interface AppLogMeta {
  statusCode?: number;
  path?: string;
  clientIp?: string;
  method?: string;
  error?: Error;
  [key: string]: unknown;
}

// Configure logger with environment-aware settings
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  defaultMeta: {
    service: process.env.APP_NAME || "app",
    environment: process.env.NODE_ENV || "development",
  },
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    // Rotating file transport (production only)
    ...(process.env.NODE_ENV === "production"
      ? [
          new DailyRotateFile({
            filename: "logs/application-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
            auditFile: "logs/.audit.json",
            utc: true,
          }),
        ]
      : []),
    // Enhanced console transport (development friendly)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
          }`;
        })
      ),
    }),
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: "logs/exceptions-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: "logs/rejections-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
    }),
  ],
});

// Add request metadata to logs
export function logRequestError(
  err: Error & { statusCode?: number },
  req: NextRequest
) {
  const clientIp =
    req.headers.get("x-client-ip") ||
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.ip ||
    "Unknown IP";
  const meta: AppLogMeta = {
    statusCode: err.statusCode,
    path: req.nextUrl.pathname,
    clientIp,
    method: req.method,
    error: err,
  };

  logger.log({
    level: err.statusCode && err.statusCode >= 500 ? "error" : "warn",
    message: err.message,
    ...meta,
  });
}

// Optional: Add correlation ID support
// import { v4 as uuidv4 } from "uuid";
logger.defaultMeta.correlationId = uuidv4();

export default logger;
