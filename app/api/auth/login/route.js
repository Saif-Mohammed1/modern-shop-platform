import { logIn } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { connectDB } from "@/app/_server/db/db";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    await connectDB();
    //   .then((re) => ////console.log("success connect to db"))
    //   .catch((re) => ////console.log("failed connect to db"));
    const { user, accessToken, refreshAccessToken, statusCode } = await logIn(
      req
    );

    const response = NextResponse.json(
      {
        ...user,
        accessToken,
      },
      { status: statusCode }
    );
    // /   path: "/", // Ensure the cookie is available across all routes
    //   expires: new Date(
    //     Date.now() +
    //       process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    //   ),
    //   httpOnly: true,
    //   // overwrite: true,
    //   sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax", // 'Lax' in development if set none need secure to true
    //   secure: process.env.NODE_ENV === "production" ? true : false, // 'false' in development
    //   // domain: process.env.NODE_ENV === "production" ? undefined : undefined, // No domain in localhost
    //   // secure: req?.secure || req?.headers["x-forwarded-proto"] === "https",
    // });
    response.cookies.set({
      name: "refreshAccessToken",
      value: refreshAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      expires: new Date(
        Date.now() +
          process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRES_IN * 60 * 60 * 24 * 1000
      ),
      path: "/",
      maxAge: process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRES_IN * 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
// export const POST = async (req) => {
//   try {
//     await connectDB();
//     //   .then((re) => ////console.log("success connect to db"))
//     //   .catch((re) => ////console.log("failed connect to db"));

//     const { user, accessToken, statusCode } = await logIn(req);

//     return NextResponse.json(
//       {
//         ...user,
//         accessToken,
//       },
//       { status: statusCode }
//     );
//   } catch (error) {
//     return ErrorHandler(error, req);
//   }
// };
