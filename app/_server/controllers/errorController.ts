import AppError from "@/app/lib/util/appError";
import { type NextRequest, NextResponse } from "next/server";
import { errorControllerTranslate } from "../_Translate/errorControllerTranslate";
import { lang } from "@/app/lib/util/lang";
interface CastError {
  path: string;
  value: string;
}

interface DuplicateFieldsError {
  errmsg: string;
}
interface ValidationError {
  _message: string;
  errors: {
    [key: string]: {
      properties: {
        type: string;
        path: string;
        value: any;
      };
    };
  };
}
const handleCastErrorDB = (err: CastError): AppError => {
  // const message = `Invalid ${err.path}: ${err.value}.`;
  const message = errorControllerTranslate[lang].controllers.handleCastErrorDB(
    err.path,
    err.value
  ).message;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: DuplicateFieldsError): AppError => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)?.[0] || "unknown value";
  // const message = `Duplicate field value: ${value}. Please use another value!`;
  const message =
    errorControllerTranslate[lang].controllers.handleDuplicateFieldsDB(
      value
    ).message;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: ValidationError) => {
  const schemaName = err._message.split(" ")[0].toLowerCase() ?? " ";
  const errors = Object.values(err.errors).map((el: any) => {
    const type = el.properties.type; //u need to check this if exist in error object
    const path = el.properties.path;

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

const handleJWTError = (): AppError =>
  new AppError(
    errorControllerTranslate[lang].controllers.handleJWTError.message,
    401
  );

const handleJWTExpiredError = (): AppError =>
  new AppError(
    errorControllerTranslate[lang].controllers.handleJWTExpiredError.message,
    401
  );

const sendErrorDev = (err: any, req: NextRequest) => {
  // A) API
  if (req.nextUrl.pathname.startsWith("/api/")) {
    if (err.name === "JsonWebTokenError") err = handleJWTError();
    if (err.name === "TokenExpiredError") err = handleJWTExpiredError();

    return NextResponse.json(
      {
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
      },
      { status: err.statusCode }
    );
  }

  // B) RENDERED WEBSITE
  //console.error("ERROR 💥", err);
  return NextResponse.json(
    {
      //   message: "Something went wrong!",
      message: err.message,
    },
    { status: err.statusCode }
  );
};

const sendErrorProd = (err: any, req: NextRequest) => {
  // A) API
  if (req.nextUrl.pathname.startsWith("/api/")) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return NextResponse.json(
        {
          status: err.status,
          message: err.message,
        },
        { status: err.statusCode }
      );
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    //console.error("ERROR 💥", err);
    // 2) Send generic message
    return NextResponse.json(
      {
        status: "error",
        // message:
        //   "Something went very wrong!. If the error persists, please let us know. ",
        message: errorControllerTranslate[lang].errors.globalError,
      },
      { status: 500 }
    );
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return NextResponse.json(
      {
        message: err.message,
      },
      { status: err.statusCode }
    );
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  //console.error("ERROR 💥", err);
  // 2) Send generic message
  return NextResponse.json(
    {
      // title: "Something went wrong!",
      // message: "Please try again later.",
      message: errorControllerTranslate[lang].errors.globalError,
    },
    { status: err.statusCode }
  );
};

const ErrorHandler = (err: any, req: NextRequest) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, req);
  } else if (process.env.NODE_ENV === "production") {
    // let error = { ...err };
    let error = err;
    error.message = err.message;
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    return sendErrorProd(error, req);
  }
};
export default ErrorHandler;
