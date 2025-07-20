// graphqlErrorFormatter.ts
import type { GraphQLFormattedError } from "graphql";
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

// Error classification functions
const isDBError = (error: unknown): error is DBError => {
  return (
    error instanceof Error &&
    Object.prototype.hasOwnProperty.call(error, "code")
  );
};

const handleZodValidationError = (error: z.ZodError): AppError => {
  const errors = error.issues.map((issue) => {
    const path = issue.path.join(".");
    return errorControllerTranslate[lang].controllers.zodError(path);
  });
  return new AppError(errors.join("; "), 400);
};

const handleUniqueViolationError = (error: DBError): AppError => {
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

const handleForeignKeyViolationError = (error: DBError): AppError => {
  const table = error.table || "table";
  return new AppError(
    errorControllerTranslate[lang].controllers.foreignKeyViolationError(table),
    409
  );
};

const handleInvalidInputError = (error: DBError): AppError => {
  return new AppError(
    errorControllerTranslate[lang].controllers.invalidInputError(
      error.detail || "invalid input"
    ),
    400
  );
};

const handleNotNullViolationError = (error: DBError): AppError => {
  const column = error.column || "field";
  return new AppError(
    errorControllerTranslate[lang].controllers.notNullViolationError(column),
    400
  );
};

const handleUndefinedColumnError = (error: DBError): AppError => {
  return new AppError(
    errorControllerTranslate[lang].controllers.undefinedColumnError(
      error.column || "unknown column"
    ),
    500
  );
};

const handleUndefinedTableError = (error: DBError): AppError => {
  return new AppError(
    errorControllerTranslate[lang].controllers.undefinedTableError(
      error.table || "unknown table"
    ),
    500
  );
};

const handleGenericDBError = (error: DBError): AppError => {
  return new AppError(
    errorControllerTranslate[lang].controllers.genericDBError(
      error.code || "unknown"
    ),
    500
  );
};
const handleGenericError = (error: Error): AppError => {
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
  return new AppError(
    error.message || errorControllerTranslate[lang].errors.globalError,
    500
  );
};

const handleDBError = (error: DBError): AppError => {
  switch (error.code) {
    case "23505": {
      return handleUniqueViolationError(error);
    }
    case "23503": {
      return handleForeignKeyViolationError(error);
    }
    case "22P02": {
      return handleInvalidInputError(error);
    }
    case "23502": {
      return handleNotNullViolationError(error);
    }
    case "42703": {
      return handleUndefinedColumnError(error);
    }
    case "42P01": {
      return handleUndefinedTableError(error);
    }
    default: {
      return handleGenericDBError(error);
    }
  }
};

const classifyError = (error: unknown): AppError => {
  try {
    if (error instanceof AppError) {
      return error;
    }
    if (error instanceof z.ZodError) {
      return handleZodValidationError(error);
    }
    if (isDBError(error)) {
      return handleDBError(error);
    }
    if (error instanceof Error) {
      return handleGenericError(error);
    }

    return new AppError(errorControllerTranslate[lang].errors.globalError, 500);
  } catch (e) {
    logger.error("Error classification failed:", e);
    return new AppError(errorControllerTranslate[lang].errors.globalError, 500);
  }
};

const getErrorCode = (statusCode: number): string => {
  if (statusCode === 401) {
    return "UNAUTHENTICATED";
  }
  if (statusCode >= 400 && statusCode < 500) {
    return "CLIENT_ERROR";
  }
  return "INTERNAL_SERVER_ERROR";
};

// Main GraphQL error formatter
export const graphqlErrorFormatter = (
  formattedError: GraphQLFormattedError,
  error: unknown
): GraphQLFormattedError => {
  try {
    // Type guard for error with originalError property
    const hasOriginalError = (
      err: unknown
    ): err is { originalError?: Error } => {
      return typeof err === "object" && err !== null && "originalError" in err;
    };

    const originalError = hasOriginalError(error) ? error.originalError : error;
    const correlationId = uuidv4(); // Generate new correlation ID
    const classifiedError = classifyError(originalError);

    // Debug logging for development
    if (process.env.NODE_ENV === "development") {
      logger.debug("GraphQL Error Debug:", {
        formattedMessage: formattedError.message,
        originalMessage: classifiedError.message,
        statusCode: classifiedError.statusCode,
        correlationId,
      });
    }

    // Production handling
    if (process.env.NODE_ENV === "production") {
      if (classifiedError.statusCode >= 500) {
        return {
          message: "Internal server error",
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            status: 500,
            correlationId,
          },
        };
      }

      return {
        message: classifiedError.message,
        extensions: {
          code: getErrorCode(classifiedError.statusCode),
          status: classifiedError.statusCode,
          correlationId,
        },
      };
    }

    // Development handling
    return {
      message: classifiedError.message,
      locations: formattedError.locations,
      path: formattedError.path,
      extensions: {
        code: getErrorCode(classifiedError.statusCode),
        status: classifiedError.statusCode,
        correlationId,
        stack: classifiedError.stack,
      },
    };
  } catch (formatError) {
    logger.error("GraphQL error formatting failed:", formatError);
    return {
      message: "Internal server error",
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
        status: 500,
        correlationId: uuidv4(),
      },
    };
  }
};
