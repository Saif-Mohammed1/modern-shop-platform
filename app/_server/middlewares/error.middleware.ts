// import { Request, Response, NextFunction } from "express";

// export const errorHandler = (
//   err: Error,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   console.error(err.stack);

//   const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
//   res.status(statusCode).json({
//     message: err.message,
//     stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
//   });
// };
