import { type NextRequest, NextResponse } from "next/server";
import AppError from "@/app/lib/utilities/appError";
import { errorControllerTranslate } from "../../../public/locales/server/errorControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { z } from "zod";
import logger, {
  createRequestLogger,
  logRequestError,
} from "@/app/lib/logger/logs";

// Type definitions
interface CastError {
  path: string;
  value: string;
}

interface DuplicateFieldsError {
  errmsg: string;
}

interface ValidationError {
  _message: string;
  errors: Record<
    string,
    { properties: { type: string; path: string; value: any } }
  >;
}

// Utility Type Export

class ErrorHandler {
  private requestLogger: ReturnType<typeof createRequestLogger>;

  constructor() {
    this.requestLogger = createRequestLogger();
  }
  // Main Error Handler
  main = (error: any, req: NextRequest): NextResponse => {
    const correlationId = this.requestLogger.defaultMeta
      .correlationId as string;
    let err =
      error instanceof AppError
        ? error
        : new AppError(
            error.message || errorControllerTranslate[lang].errors.globalError,

            error.statusCode || 500
          );

    if (error instanceof z.ZodError) {
      err = this.handleZodValidationError(error);
    }
    if (error.name === "JsonWebTokenError") err = this.handleJWTError();
    if (error.name === "TokenExpiredError") err = this.handleJWTExpiredError();
    // Production error processing
    if (process.env.NODE_ENV === "production") {
      if (error instanceof z.ZodError) {
        err = this.handleZodValidationError(error);
      }

      if (error.name === "CastError") err = this.handleCastErrorDB(error);
      if (error.code === 11000) err = this.handleDuplicateFieldsDB(error);
      if (error.name === "ValidationError")
        err = this.handleValidationErrorDB(error);

      // Log errors
      // Enhanced logging with translation context
      logRequestError(err, req, correlationId);
    }

    return process.env.NODE_ENV === "development"
      ? this.sendErrorDev(err, req)
      : this.sendErrorProd(err);
  };
  // Zod Error Handler
  private handleZodValidationError = (err: z.ZodError): AppError => {
    // Get metadata from the schema instance

    // Process validation errors
    const errors = err.issues.map((issue) => {
      // const path = issue.path.join(".");
      // const errorCode = issue.code;

      return issue.message;
    });
    return new AppError(errors.join("; "), 400);
  };
  // Database Error Handlers
  private handleCastErrorDB = (err: CastError): AppError => {
    const message = errorControllerTranslate[
      lang
    ].controllers.handleCastErrorDB(err.path, err.value).message;
    return new AppError(message, 400);
  };

  private handleDuplicateFieldsDB = (err: DuplicateFieldsError): AppError => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)?.[0] || "unknown value";
    const message =
      errorControllerTranslate[lang].controllers.handleDuplicateFieldsDB(
        value
      ).message;
    return new AppError(message, 400);
  };

  // private handleValidationErrorDB = (err: ValidationError): AppError => {
  //   const schemaName = err._message.split(" ")[0].toLowerCase() ?? "validation";
  //   const errors = Object.entries(err.errors).map(([field, error]) => {
  //     const errorType = error.properties.type;
  //     return (
  //       errorControllerTranslate[lang]?.controllers?.handleValidationErrorDB?.[
  //         schemaName
  //       ]?.[field]?.[errorType] || `Invalid ${field} value`
  //     );
  //   });

  //   return new AppError(errors.join("; "), 400);
  // };
  private handleValidationErrorDB = (err: ValidationError) => {
    const schemaName = err._message.split(" ")[0].toLowerCase() ?? " ";
    const errors = Object.values(err.errors).map((el: any) => {
      const type = el.properties.type; //u need to check this if exist in error object
      const path = el.properties.path;

      // Add checks before accessing dynamic properties
      const schemaErrors = (
        errorControllerTranslate[lang].controllers
          .handleValidationErrorDB as any
      )[schemaName];

      let message = "An error occurred";

      if (schemaErrors && schemaErrors[path] && schemaErrors[path][type]) {
        message = schemaErrors[path][type];
      }

      return message;
    });

    return new AppError(errors.join(","), 400);
  };
  // JWT Handlers
  private createAuthError = (
    // translationKey: keyof (typeof errorControllerTranslate)[typeof lang]["controllers"]
    translationKey: "handleJWTError" | "handleJWTExpiredError"
  ) =>
    new AppError(
      errorControllerTranslate[lang].controllers[translationKey].message,
      401
    );

  private handleJWTError = () => this.createAuthError("handleJWTError");
  private handleJWTExpiredError = () =>
    this.createAuthError("handleJWTExpiredError");

  // Error Response Formatters
  createErrorResponse = (err: AppError, includeDetails: boolean) =>
    NextResponse.json(
      {
        status: err.status,
        message: err.message,
        ...(includeDetails && { stack: err.stack }),
      },
      { status: err.statusCode }
    );

  // Environment-specific Handlers
  private sendErrorDev = (err: AppError, req: NextRequest) => {
    if (err.name === "ZodError") return this.createErrorResponse(err, true);
    return this.createErrorResponse(
      err,
      req.nextUrl.pathname.startsWith("/api/")
    );
  };

  private sendErrorProd = (err: AppError) => {
    // Log operational errors for monitoring
    if (!err.isOperational) logger.error("ERROR 💥", err);

    return NextResponse.json(
      {
        status: err.status,
        message: err.isOperational
          ? err.message
          : errorControllerTranslate[lang].errors.globalError,
      },
      { status: err.statusCode }
    );
  };
}
// Create single instance
const errorHandler = new ErrorHandler();

// Export types and instance
export type ErrorResponse = ReturnType<typeof errorHandler.main>;
export default errorHandler.main;
