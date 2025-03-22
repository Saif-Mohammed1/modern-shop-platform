import { NextRequest } from "next/server";
import { connectDB } from "@/app/_server/db/db";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies, headers } from "next/headers";
import AppError from "@/app/lib/utilities/appError";
import twoFactorController from "@/app/_server/controllers/2fa.controller";
import { authControllerTranslate } from "@/public/locales/server/authControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";

import tokenManager from "@/app/lib/utilities/TokenManager";
import sessionController from "@/app/_server/controllers/session.controller";
import authController from "@/app/_server/controllers/auth.controller";
const REFRESH_THRESHOLD = 3 * 60 * 1000; // Refresh 3 minutes before expiration
const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: Number(process.env.NEXTAUTH_SESSION_MAX_AGE || 7) * 60 * 60 * 24, // 7 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials) {
        try {
          const { email, password, code } = credentials as {
            email: string;
            password: string;
            code: number;
          };
          await connectDB();

          if (!code) {
            if (!email || !password) {
              throw new AppError(
                authControllerTranslate[
                  lang
                ].functions.logIn.invalidEmailOrPassword,
                400
              );
            }
            const req = new NextRequest(
              new URL(process.env.NEXT_PUBLIC_API_ENDPOINT + "/auth"),
              {
                headers: headers(),
                method: "POST",
                body: JSON.stringify({
                  email: email,
                  password: password,
                }),
              }
            );

            const result = await authController.login(req);
            const statusCode = result.status;
            const { user } = await result.json(); // Extract JSON data
            // Use a type guard to check if `user` has `requires2FA`

            if (
              statusCode === 202 ||
              ("requires2FA" in user && user.requires2FA)
            ) {
              throw new AppError(
                authControllerTranslate[lang].functions.logIn.twoFactorRequired,
                401
              );
            }
            if (!user || statusCode !== 200) {
              return null;
            }
            if ("_id" in user) {
              return {
                ...user,
                id: String(user._id),
              };
            }
            return null;
          } else {
            const req = new NextRequest(
              new URL(
                process.env.NEXT_PUBLIC_API_ENDPOINT + "/auth/2fa/verify"
              ),
              {
                headers: headers(),
                method: "PUT",
                body: JSON.stringify({
                  code: code,
                  email,
                }),
              }
            );
            const result = await twoFactorController.verify2FALogin(req);
            const { user } = await result.json(); // Extract JSON data

            if (!user) {
              return null;
            }
            return {
              ...user,
              id: String(user._id),
              accessToken: user.accessToken,
              accessTokenExpires:
                Date.now() +
                Number(process.env.JWT_ACCESS_TOKEN_COOKIE_EXPIRES_IN || 15) *
                  60 *
                  1000,
            };
          }
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial login
      if (user) {
        // token.user = user as UserAuthType;

        // convert accessTokenExpires to readable time
        const exp = user.accessTokenExpires
          ? Math.floor(user.accessTokenExpires / 1000)
          : Number(process.env.JWT_ACCESS_TOKEN_COOKIE_EXPIRES_IN || 15) * 60;
        return {
          ...token,
          user,
          exp,
        };
      }

      // Session update
      if (trigger === "update") {
        // token.user = session.user;
        // token.accessToken = session.accessToken;
        // token.accessTokenExpires = session.;
        token.user = session.user;
      }

      // // Handle token refresh
      // if (
      //   token.user?.accessTokenExpires &&
      //   Date.now() > token.user.accessTokenExpires - REFRESH_THRESHOLD
      // ) {
      //
      //   const refreshedToken = await refreshAccessTokenHandler(token);
      //   return refreshedToken;
      // }
      // Handle token refresh before expiration
      if (token.user?.accessTokenExpires) {
        const remainingTime = token.user.accessTokenExpires - Date.now();

        // Refresh if within threshold or already expired
        if (remainingTime < REFRESH_THRESHOLD) {
          try {
            return await refreshAccessTokenHandler(token);
          } catch (error) {
            return { ...token, error: "RefreshAccessTokenError" };
          }
        }
      }
      if (token.user.accessToken) {
        tokenManager.setAccessToken(token.user.accessToken);
      }
      return token;
    },
    async session({ session, token }) {
      if (token.error) {
        session.error =
          typeof token.error === "string" ? token.error : String(token.error);
      }
      if (token) {
        session.user = token.user;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth",
    newUser: "/auth/register",

    // error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
// this is next-auth jwt function what shoud be the right type for this
async function refreshAccessTokenHandler(token: any) {
  try {
    // const { data } = await api.get(`/auth/refresh-token`, {
    //   headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
    //   // headers: {
    //   //   "set-cookie": `refreshAccessToken=${refreshAccessToken}`,
    //   // },
    // });
    const req = new NextRequest(
      new URL(process.env.NEXT_PUBLIC_API_ENDPOINT + "/auth/refresh-token"),
      {
        headers: headers(),
        method: "GET",
      }
    );
    const result = await sessionController.refreshAccessToken(req);
    const { accessToken } = await result.json();
    tokenManager.setAccessToken(accessToken);
    return {
      ...token,
      user: {
        ...token.user,
        accessToken,
        accessTokenExpires:
          Date.now() +
          Number(process.env.JWT_ACCESS_TOKEN_COOKIE_EXPIRES_IN || 15) *
            60 *
            1000, // 15 minutes
      },
      exp: Math.floor(
        Number(process.env.JWT_ACCESS_TOKEN_COOKIE_EXPIRES_IN || 15) * 60
      ), // Set JWT expiration
    };
  } catch (error) {
    cookies().delete("refreshAccessToken");
    // return {
    //   ...token,
    //   error: "RefreshAccessTokenError",
    // };
    throw error;
  }
}
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
