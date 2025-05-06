import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logRequestError } from "../../lib/logger/logs";
import AppError from "../../lib/utilities/appError";
import { lang } from "../../lib/utilities/lang";

import { errorControllerTranslate } from "../../../public/locales/server/errorControllerTranslate";

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

// Zod Error Handler
const handleZodValidationError = (err: z.ZodError): AppError => {
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
const handleCastErrorDB = (err: CastError): AppError => {
  const { message } = errorControllerTranslate[
    lang
  ].controllers.handleCastErrorDB(err.path, err.value);
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: DuplicateFieldsError): AppError => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)?.[0] || "unknown value";
  const { message } =
    errorControllerTranslate[lang].controllers.handleDuplicateFieldsDB(value);
  return new AppError(message, 400);
};

// const handleValidationErrorDB = (err: ValidationError): AppError => {
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
const handleValidationErrorDB = (err: ValidationError) => {
  const schemaName = err._message.split(" ")[0].toLowerCase() ?? " ";
  const errors = Object.values(err.errors).map((el: any) => {
    const { type } = el.properties; //u need to check this if exist in error object
    const { path } = el.properties;

    // Add checks before accessing dynamic properties
    const schemaErrors = (
      errorControllerTranslate[lang].controllers.handleValidationErrorDB as any
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
const createAuthError = (
  // translationKey: keyof (typeof errorControllerTranslate)[typeof lang]["controllers"]
  translationKey: "handleJWTError" | "handleJWTExpiredError"
) =>
  new AppError(
    errorControllerTranslate[lang].controllers[translationKey].message,
    401
  );

const handleJWTError = () => createAuthError("handleJWTError");
const handleJWTExpiredError = () => createAuthError("handleJWTExpiredError");

// Error Response Formatters
const createErrorResponse = (err: AppError, includeDetails: boolean) =>
  NextResponse.json(
    {
      status: err.status,
      message: err.message,
      ...(includeDetails && { stack: err.stack }),
    },
    { status: err.statusCode }
  );

// Environment-specific Handlers
const sendErrorDev = (err: AppError, req: NextRequest) => {
  if (err.name === "ZodError") {
    return createErrorResponse(err, true);
  }
  return createErrorResponse(err, req.nextUrl.pathname.startsWith("/api/"));
};

const sendErrorProd = (err: AppError) => {
  // Log operational errors for monitoring
  if (!err.isOperational) {
    console.error("ERROR 💥", err);
  }

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

// Main Error Handler
const ErrorHandler = (error: any, req: NextRequest): NextResponse => {
  let err =
    error instanceof AppError
      ? error
      : new AppError(
          error.message || errorControllerTranslate[lang].errors.globalError,

          error.statusCode || 500
        );

  if (error instanceof z.ZodError) {
    err = handleZodValidationError(error);
  }
  if (error.name === "JsonWebTokenError") {
    err = handleJWTError();
  }
  if (error.name === "TokenExpiredError") {
    err = handleJWTExpiredError();
  }
  // Production error processing
  if (process.env.NODE_ENV === "production") {
    if (error instanceof z.ZodError) {
      err = handleZodValidationError(error);
    }

    if (error.name === "CastError") {
      err = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      err = handleDuplicateFieldsDB(error);
    }
    if (error.name === "ValidationError") {
      err = handleValidationErrorDB(error);
    }
    // if (error.name === "JsonWebTokenError") err = handleJWTError();
    // if (error.name === "TokenExpiredError") err = handleJWTExpiredError();
    // Log errors
    // Enhanced logging with translation context
    logRequestError(err, req);
  }

  return process.env.NODE_ENV === "development"
    ? sendErrorDev(err, req)
    : sendErrorProd(err);
};

// Utility Type Export
export type ErrorResponse = ReturnType<typeof ErrorHandler>;
export default ErrorHandler;
