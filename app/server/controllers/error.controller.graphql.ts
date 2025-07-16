import { GraphQLError } from "graphql";
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

interface GraphQLErrorExtensions {
  code?: string;
  status?: number;
  exception?: {
    stacktrace?: string[];
  };
  [key: string]: any;
}

class ErrorHandler {
  private correlationId!: string;

  main = (error: unknown, req: NextRequest | null): NextResponse | any => {
    this.correlationId = req?.headers.get("X-Correlation-ID") || uuidv4();
    let err: AppError;

    try {
      if (error instanceof AppError) {
        err = error;
      } else if (error instanceof GraphQLError) {
        err = this.handleGraphQLError(error);
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
      logger.error("Error handler failed:", {
        originalError: error,
        handlerError: handlerError,
        correlationId: this.correlationId,
      });
    }

    return req
      ? this.sendErrorResponse(err, req)
      : this.formatGraphQLError(err);
  };

  private isDBError(error: unknown): error is DBError {
    return (
      error instanceof Error &&
      Object.prototype.hasOwnProperty.call(error, "code")
    );
  }

  private handleGraphQLError = (error: GraphQLError): AppError => {
    const extensions = error.extensions as GraphQLErrorExtensions;
    const errorCode = extensions?.code;

    // Handle specific null field errors
    if (this.isNullFieldError(error)) {
      return this.handleNullFieldError(error);
    }

    // Check if this is a Zod validation error wrapped in GraphQL error
    if (this.isZodValidationError(error)) {
      return this.handleWrappedZodError(error);
    }

    // Log GraphQL error details for debugging
    logger.error("GraphQL Error Details:", {
      message: error.message,
      code: errorCode,
      path: error.path,
      locations: error.locations,
      extensions: extensions,
      correlationId: this.correlationId,
    });

    switch (errorCode) {
      case "GRAPHQL_VALIDATION_FAILED":
        return new AppError(
          errorControllerTranslate[lang].controllers.graphqlValidationError,
          400
        );
      case "GRAPHQL_PARSE_FAILED":
        return new AppError(
          errorControllerTranslate[lang].controllers.graphqlParseError,
          400
        );
      case "BAD_USER_INPUT":
        return new AppError(
          errorControllerTranslate[lang].controllers.badUserInputError,
          400
        );
      case "UNAUTHENTICATED":
        return new AppError(
          errorControllerTranslate[lang].controllers.unauthenticatedError,
          401
        );
      case "FORBIDDEN":
        return new AppError(
          errorControllerTranslate[lang].controllers.forbiddenError,
          403
        );
      case "PERSISTED_QUERY_NOT_FOUND":
        return new AppError(
          errorControllerTranslate[
            lang
          ].controllers.persistedQueryNotFoundError,
          404
        );
      case "INTERNAL_SERVER_ERROR":
        return new AppError(
          errorControllerTranslate[lang].controllers.internalServerError,
          500
        );
      case "OPERATION_NOT_ALLOWED":
        return new AppError(
          errorControllerTranslate[lang].controllers.forbiddenError,
          403
        );
      default: {
        // Handle unknown GraphQL errors
        const errorMessage =
          error.message || errorControllerTranslate[lang].errors.globalError;

        // If it's a validation error based on message content, treat as client error
        if (this.isValidationRelatedError(error)) {
          return new AppError(errorMessage, 400);
        }

        const statusCode = extensions?.status || 500;

        logger.warn("Unknown GraphQL Error Code:", {
          code: errorCode,
          message: errorMessage,
          correlationId: this.correlationId,
        });

        return new AppError(errorMessage, statusCode);
      }
    }
  };

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

      // Map specific field paths to specific error messages
      switch (path) {
        case "phone":
          return errorControllerTranslate[lang].controllers
            .phoneValidationError;
        case "email":
          return errorControllerTranslate[lang].controllers
            .emailValidationError;
        case "password":
          return errorControllerTranslate[lang].controllers
            .passwordValidationError;
        default:
          // Use the actual error message from Zod if available, otherwise use generic
          return (
            issue.message ||
            errorControllerTranslate[lang].controllers.zodError(path)
          );
      }
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
        message: err.message,
        status: err.statusCode,
        instance: req.url,
        correlationId: this.correlationId,
        ...(process.env.NODE_ENV === "development" && {
          detail: err.stack,
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

  private formatGraphQLError = (err: AppError) => {
    logger.error(`[${this.correlationId}] GraphQL Error:`, {
      message: err.message,
      status: err.statusCode,
      stack: err.stack,
      correlationId: this.correlationId,
    });

    if (process.env.NODE_ENV === "production") {
      // In production, return sanitized error
      return new GraphQLError(
        err.statusCode >= 500
          ? errorControllerTranslate[lang].errors.globalError
          : err.message,
        {
          extensions: {
            code:
              err.statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "CLIENT_ERROR",
            status: err.statusCode,
            correlationId: this.correlationId,
          },
        }
      );
    }

    // In development, return detailed error
    return new GraphQLError(err.message, {
      extensions: {
        code: err.statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "CLIENT_ERROR",
        status: err.statusCode,
        stack: err.stack,
        correlationId: this.correlationId,
      },
    });
  };

  private isNullFieldError(error: GraphQLError): boolean {
    return error.message.includes("Cannot return null for non-nullable field");
  }

  private handleNullFieldError(error: GraphQLError): AppError {
    const fieldMatch = error.message.match(
      /Cannot return null for non-nullable field (.+?)\./
    );
    const fieldName = fieldMatch?.[1] || "unknown field";

    return new AppError(
      `Required field '${fieldName}' is missing or null. Please check your data.`,
      500
    );
  }

  private isZodValidationError(error: GraphQLError): boolean {
    // Check if the error message contains Zod validation patterns
    const errorMessage = error.message;
    const exception = error.extensions?.exception;

    return (
      errorMessage.includes('"validation":') ||
      errorMessage.includes('"code":"invalid_') ||
      errorMessage.includes('"code":"custom"') ||
      errorMessage.includes("ZodError") ||
      errorMessage.includes("Invalid phone number format") ||
      errorMessage.includes("Invalid email") ||
      errorMessage.includes("Password must") ||
      (exception &&
        typeof exception === "object" &&
        "name" in exception &&
        exception.name === "ZodError")
    );
  }

  private handleWrappedZodError(error: GraphQLError): AppError {
    try {
      // Try to parse the Zod error from the message
      let zodIssues: any[] = [];

      // Check if it's a JSON array in the message
      if (error.message.startsWith("[") && error.message.endsWith("]")) {
        zodIssues = JSON.parse(error.message);
      } else if (error.message.includes("ZodError:")) {
        // Extract JSON from ZodError message
        const jsonMatch = error.message.match(/\[([\s\S]*)\]/);
        if (jsonMatch) {
          zodIssues = JSON.parse(`[${jsonMatch[1]}]`);
        }
      }

      if (zodIssues.length > 0) {
        const errors = zodIssues.map((issue: any) => {
          // Safely extract path with type checking
          let path = "field";
          if (issue && typeof issue === "object" && "path" in issue) {
            const issuePath = (issue as { path: unknown }).path;
            if (Array.isArray(issuePath)) {
              path = issuePath.join(".");
            }
          }

          // Map specific field paths to specific error messages
          switch (path) {
            case "phone":
              return errorControllerTranslate[lang].controllers
                .phoneValidationError;
            case "email":
              return errorControllerTranslate[lang].controllers
                .emailValidationError;
            case "password":
              return errorControllerTranslate[lang].controllers
                .passwordValidationError;
            default: {
              // Use the actual error message from Zod if available, otherwise use generic
              let issueMessage =
                errorControllerTranslate[lang].controllers.zodError(path);
              if (issue && typeof issue === "object" && "message" in issue) {
                const { message } = issue as { message: unknown };
                if (typeof message === "string") {
                  issueMessage = message;
                }
              }
              return issueMessage;
            }
          }
        });
        return new AppError(errors.join("; "), 400);
      }
    } catch (parseError) {
      logger.warn("Failed to parse Zod error from GraphQL error:", parseError);
    }

    // Fallback to generic validation error
    return new AppError(
      errorControllerTranslate[lang].controllers.badUserInputError,
      400
    );
  }

  private isValidationRelatedError(error: GraphQLError): boolean {
    const message = error.message.toLowerCase();
    return (
      message.includes("validation") ||
      message.includes("invalid") ||
      message.includes("required") ||
      message.includes("format") ||
      error.path?.some((path) =>
        ["phone", "email", "password", "name"].includes(String(path))
      ) ||
      false
    );
  }
}

const errorHandler = new ErrorHandler();
export default errorHandler.main;
