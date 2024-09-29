import { logIn } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";

// export const POST = async (req) => {
//   try {
//     await connectDB();
//     //   .then((re) => ////console.log("success connect to db"))
//     //   .catch((re) => ////console.log("failed connect to db"));
//     const { user, accessToken, refreshAccessToken, statusCode } = await logIn(
//       req
//     );

//     const response = NextResponse.json(
//       {
//         ...user,
//         accessToken,
//       },
//       { status: statusCode }
//     );

//     response.cookies.set({
//       name: "refreshAccessToken",
//       value: refreshAccessToken,
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
//       expires: new Date(
//         Date.now() +
//           process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRES_IN * 60 * 60 * 24 * 1000
//       ),
//       path: "/",
//       maxAge: process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRES_IN * 60 * 60 * 24,
//     });

//     return response;
//   } catch (error) {
//     return ErrorHandler(error, req);
//   }
// };
export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    //   .then((re) => ////console.log("success connect to db"))
    //   .catch((re) => ////console.log("failed connect to db"));

    const { user, accessToken, statusCode } = await logIn(req);

    return NextResponse.json(
      {
        ...user,
        accessToken,
      },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
