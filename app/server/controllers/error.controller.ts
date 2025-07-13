// errorHandler.ts
import { NextResponse, type NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import logger from "@/app/lib/logger/logs";
import AppError from "@/app/lib/utilities/appError";
import { lang } from "@/app/lib/utilities/lang";
import { errorControllerTranslate } from "@/public/locales/server/errorControllerTranslate";

interface DBError extends Error {
  code?: string;
  detail?: string;
  table?: string;
  column?: string;
  constraint?: string;
  routine?: string;
  schema?: string;
  severity?: string;
}

// interface ZodValidationError {
//   type: "body" | "query" | "params";
//   errors: z.ZodIssue[];
// }

class ErrorHandler {
  private correlationId!: string;

  main = (error: unknown, req: NextRequest): NextResponse => {
    // console.log("error controller", error);

    this.correlationId = req.headers.get("X-Correlation-ID") || uuidv4();
    let err: AppError;

    try {
      if (error instanceof AppError) {
        err = error;
      } else if (error instanceof z.ZodError) {
        err = this.handleZodValidationError(error);
      } else if (this.isDBError(error)) {
        err = this.handleDBError(error);
      } else if (error instanceof Error) {
        err = this.handleGenericError(error);
      } else {
        err = new AppError(
          errorControllerTranslate[lang].errors.globalError,
          500
        );
      }
    } catch (handlerError) {
      err = new AppError(
        errorControllerTranslate[lang].errors.globalError,
        500
      );
      logger.error("Error handler failed:", handlerError);
    }

    return this.sendErrorResponse(err, req);
  };

  private isDBError(error: unknown): error is DBError {
    return (
      error instanceof Error &&
      Object.prototype.hasOwnProperty.call(error, "code")
    );
  }

  private handleDBError = (error: DBError): AppError => {
    switch (error.code) {
      case "23505": // Unique violation
        return this.handleUniqueViolationError(error);
      case "23503": // Foreign key violation
        return this.handleForeignKeyViolationError(error);
      case "22P02": // Invalid text representation
        return this.handleInvalidInputError(error);
      case "23502": // Not null violation
        return this.handleNotNullViolationError(error);
      case "42703": // Undefined column
        return this.handleUndefinedColumnError(error);
      case "42P01": // Undefined table
        return this.handleUndefinedTableError(error);
      default:
        return this.handleGenericDBError(error);
    }
  };

  private handleZodValidationError = (error: z.ZodError): AppError => {
    const errors = error.issues.map((issue) => {
      const path = issue.path.join(".");
      return errorControllerTranslate[lang].controllers.zodError(path);
    });
    return new AppError(errors.join("; "), 400);
  };

  private handleUniqueViolationError = (error: DBError): AppError => {
    const matches = error.detail?.match(/Key \((.*?)\)=\((.*?)\)/);
    const field = matches?.[1] || "field";
    const value = matches?.[2] || "value";
    return new AppError(
      errorControllerTranslate[lang].controllers.uniqueViolationError(
        field,
        value
      ),
      409
    );
  };

  private handleForeignKeyViolationError = (error: DBError): AppError => {
    const constraint = error.constraint?.replace(/_foreign$/, "") || "resource";
    return new AppError(
      errorControllerTranslate[lang].controllers.foreignKeyViolationError(
        constraint
      ),
      400
    );
  };

  private handleInvalidInputError = (error: DBError): AppError => {
    const field = error.column || "field";
    return new AppError(
      errorControllerTranslate[lang].controllers.invalidInputError(field),
      400
    );
  };

  private handleNotNullViolationError = (error: DBError): AppError => {
    const field = error.column || "field";
    return new AppError(
      errorControllerTranslate[lang].controllers.notNullViolationError(field),
      400
    );
  };

  private handleUndefinedColumnError = (error: DBError): AppError => {
    const column = error.column || "column";
    return new AppError(
      errorControllerTranslate[lang].controllers.undefinedColumnError(column),
      400
    );
  };

  private handleUndefinedTableError = (error: DBError): AppError => {
    const table = error.table || "table";
    return new AppError(
      errorControllerTranslate[lang].controllers.undefinedTableError(table),
      500
    );
  };

  private handleGenericDBError = (error: DBError): AppError => {
    logger.error("Database Error:", error);
    return new AppError(
      errorControllerTranslate[lang].controllers.genericDBError(
        error.code ?? "unknown"
      ),
      500
    );
  };

  private handleGenericError = (error: Error): AppError => {
    if (error.name === "JsonWebTokenError") {
      return new AppError(
        errorControllerTranslate[lang].controllers.invalidTokenError,
        401
      );
    }
    if (error.name === "TokenExpiredError") {
      return new AppError(
        errorControllerTranslate[lang].controllers.expiredTokenError,
        401
      );
    }
    return new AppError(error.message, 500);
  };

  private sendErrorResponse = (
    err: AppError,
    req: NextRequest
  ): NextResponse => {
    logger.error(`[${this.correlationId}] Error:`, err);

    return NextResponse.json(
      {
        // type: "https://api.yourservice.com/errors/" + err.type,
        message: err.message,
        // title: err.message,
        status: err.statusCode,
        instance: req.url,
        correlationId: this.correlationId,
        ...(process.env.NODE_ENV === "development" && {
          detail: err.stack,
          // internalCode: err.type,
        }),
      },
      {
        status: err.statusCode,
        headers: {
          "X-Correlation-ID": this.correlationId,
          "Content-Type": "application/problem+json",
        },
      }
    );
  };
}

// Singleton instance
// export const errorHandler = new ErrorHandler().main;
const errorHandler = new ErrorHandler();
export default errorHandler.main;
