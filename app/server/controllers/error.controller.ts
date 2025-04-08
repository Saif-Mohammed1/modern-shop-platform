import type mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import logger, { logRequestError, logtail } from "@/app/lib/logger/logs";
import AppError from "@/app/lib/utilities/appError";
import { lang } from "@/app/lib/utilities/lang";
import { errorControllerTranslate } from "@/public/locales/server/errorControllerTranslate";

// Type definitions
// interface CastError {
//   path: string;
//   value: string;
// }

// interface DuplicateFieldsError {
//   errmsg: string;
// }

// interface ValidationError {
//   _message: string;
//   errors: Record<
//     string,
//     { properties: { type: string; path: string; value: any } }
//   >;
// }
interface CastError extends Error {
  path: string;
  value: any;
  kind?: string;
  reason?: Error;
}

interface DuplicateFieldsError extends Error {
  code?: number;
  keyValue?: Record<string, any>;
  errmsg?: string;
}

interface ValidationError extends Error {
  _message: string;
  errors: Record<
    string,
    mongoose.Error.ValidatorError //| mongoose.Error.CastError
  >;
}
// Utility Type Export

class ErrorHandler {
  private correlationId!: string;
  // Main Error Handler
  main = (error: unknown, req: NextRequest): NextResponse => {
    this.correlationId = req.headers.get("X-Correlation-ID") || uuidv4();

    // Convert error to AppError
    let err = this.normalizeError(error);

    // Check if the error is an instance of AppError
    if (error instanceof z.ZodError) {
      err = this.handleZodValidationError(error);
    } else if (error instanceof Error) {
      if (error.name === "JsonWebTokenError") {
        err = this.handleJWTError();
      }
      if (error.name === "TokenExpiredError") {
        err = this.handleJWTExpiredError();
      }
      // Production error processing
      if (process.env.NODE_ENV === "production") {
        // CastError (Mongoose bad ID format)
        if (error.name === "CastError" && "path" in error && "value" in error) {
          const castError = error as CastError;
          err = this.handleCastErrorDB({
            ...castError,
            path: castError.path || "unknown",
            value: castError.value || "invalid",
          });
        }
        // Check if 'code' exists before accessing it
        // Duplicate key error (Mongoose unique constraint)
        if ("code" in error && error.code === 11000) {
          const keyValue =
            "keyValue" in error && typeof error.keyValue === "object"
              ? (error.keyValue as Record<string, any>)
              : {};

          const errmsg =
            "errmsg" in error && typeof error.errmsg === "string"
              ? error.errmsg
              : `Duplicate value: ${JSON.stringify(keyValue)}`;

          const dupError: DuplicateFieldsError = {
            name: "DuplicateFieldError",
            message: "Duplicate field value",
            code: 11000,
            keyValue,
            errmsg,
          };

          err = this.handleDuplicateFieldsDB(dupError);
        }

        // ValidationError (Mongoose schema validation)
        if (
          error.name === "ValidationError" &&
          "_message" in error &&
          "errors" in error
        ) {
          const validationError = error as ValidationError;
          err = this.handleValidationErrorDB({
            ...validationError,
            _message: validationError._message || "Validation failed",
            errors: validationError.errors || {},
          });
        }

        // Log errors
        // Enhanced logging with translation context
        // logRequestError(err, req, this.correlationId);
      }
    } else {
      // Fallback for when error is not an Error (e.g., a string or other type)
      err = new AppError("An unknown error occurred", 500); // Adjust based on your AppError class
    }

    return process.env.NODE_ENV === "development"
      ? this.sendErrorDev(err, req)
      : this.sendErrorProd(err, req);
  };

  // Zod Error Handler
  private handleZodValidationError = (err: z.ZodError): AppError => {
    // Process validation errors
    const errors = err.issues.map((issue) => {
      // const path = issue.path.join(".");
      // const errorCode = issue.code;

      return issue.message;
    });
    return new AppError(errors.join("; "), 400);
  };
  private normalizeError = (error: unknown): AppError => {
    if (error instanceof AppError) {
      return error;
    } // Already an AppError instance
    return new AppError(
      error instanceof Error
        ? error.message
        : errorControllerTranslate[lang].errors.globalError,
      (error instanceof AppError && error.statusCode) || 500
    );
  };

  // Database Error Handlers
  private handleCastErrorDB = (err: CastError): AppError => {
    const { message } = errorControllerTranslate[
      lang
    ].controllers.handleCastErrorDB(err.path, err.value);
    return new AppError(message, 400);
  };

  private handleDuplicateFieldsDB = (err: DuplicateFieldsError): AppError => {
    let value = "unknown value";
    if (err.errmsg) {
      value = err.errmsg.match(/(["'])(\\?.)*?\1/)?.[0] || "unknown value";
    }
    const { message } =
      errorControllerTranslate[lang].controllers.handleDuplicateFieldsDB(value);
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
    const schemaName = err._message.split(" ")[0].toLowerCase() ?? "validation";
    const errors = Object.values(err.errors).map((el) => {
      const { type } = el.properties; //u need to check this if exist in error object
      const { path } = el.properties;
      if (!path || !type) {
        return new AppError(
          errorControllerTranslate[lang].errors.validationError,
          400
        );
      }
      // Add checks before accessing dynamic properties
      const schemaErrors: Record<
        string,
        Record<string, Record<string, string>>
      > = (
        errorControllerTranslate[lang].controllers
          .handleValidationErrorDB as Record<string, any>
      )[schemaName];

      let errormessage = String(errorControllerTranslate[lang].errors.message);
      let message = errormessage;
      if (schemaErrors?.[path]?.[type]) {
        message =
          typeof schemaErrors[path][type] === "string"
            ? schemaErrors[path][type]
            : errorControllerTranslate[lang].errors.validationError;
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
  private createErrorResponse = (err: AppError, includeDetails: boolean) =>
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
    if (err.name === "ZodError") {
      return this.createErrorResponse(err, true);
    }
    return this.createErrorResponse(
      err,
      req.nextUrl.pathname.startsWith("/api/")
    );
  };

  private sendErrorProd = (err: AppError, req: NextRequest) => {
    // Log operational errors for monitoring
    // if (!err.isOperational) logger.error("ERROR 💥", err);
    logRequestError(err, req, this.correlationId);
    logtail
      ?.flush()
      .then(() => {
        logger.log({ level: "info", message: "Logs flushed successfully." });
      })
      .catch((err) => {
        logger.error("Error flushing logs:", err);
      });
    // return NextResponse.json(
    //   {
    //     status: err.status,
    //     message: err.isOperational
    //       ? err.message
    //       : errorControllerTranslate[lang].errors.globalError,
    //   },
    //   { status: err.statusCode }
    // );
    // Add correlation ID to client response
    return NextResponse.json(
      {
        status: err.status,
        message: err.isOperational
          ? err.message
          : errorControllerTranslate[lang].errors.globalError,
        correlationId: this.correlationId,
      },
      {
        status: err.statusCode,
        headers: {
          "X-Correlation-ID": this.correlationId,
          "Content-Type": "application/problem+json", // RFC 7807 compliance
        },
      }
    );
  };
}
// Create single instance
const errorHandler = new ErrorHandler();

// Export types and instance
export type ErrorResponse = ReturnType<typeof errorHandler.main>;
export default errorHandler.main;
