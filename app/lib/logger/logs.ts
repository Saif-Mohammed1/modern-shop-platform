// lib/logger.ts
import { type NextRequest } from "next/server";
import { ipAddress } from "@vercel/functions";
import winston from "winston";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
import { v4 as uuidv4 } from "uuid";

// Initialize Logtail
const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN!);

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
    // Logtail transport (production only)
    ...(isProduction ? [new LogtailTransport(logtail)] : []),

    // Console transport (all environments)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, correlationId, ...meta }) => {
            return `[${timestamp}] [${correlationId}] ${level}: ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
            }`;
          }
        )
      ),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.Console(),
    ...(isProduction ? [new LogtailTransport(logtail)] : []),
  ],
  rejectionHandlers: [
    new winston.transports.Console(),
    ...(isProduction ? [new LogtailTransport(logtail)] : []),
  ],
});

// Add correlation ID support
export function createRequestLogger(correlationId: string = uuidv4()) {
  return logger.child({ correlationId });
}

// Enhanced request error logging
export function logRequestError(
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
    error: err,
    correlationId,
  };

  const logLevel = err.statusCode && err.statusCode >= 500 ? "error" : "warn";

  logger.log(logLevel, err.message, meta);
}

// Vercel-specific cleanup
if (isVercel) {
  process.on("SIGTERM", async () => {
    await logtail.flush();
    process.exit(0);
  });
}

export default logger;
