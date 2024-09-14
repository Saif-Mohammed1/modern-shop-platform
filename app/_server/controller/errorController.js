import { NextResponse } from "next/server";

const { default: AppError } = require("@/components/util/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

const sendErrorDev = (err, req) => {
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

const sendErrorProd = (err, req) => {
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
        message:
          "Something went very wrong!. If the error persists, please let us know. ",
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
      message: "Please try again later.",
    },
    { status: err.statusCode }
  );
};

const ErrorHandler = (err, req) => {
  // //console.log(err.stack);

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
