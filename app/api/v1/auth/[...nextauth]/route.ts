import { cookies, headers } from "next/headers";
import { NextRequest } from "next/server";
import NextAuth, { type AuthOptions, type User, type Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

import type { UserAuthType } from "@/app/lib/types/users.db.types";
import AppError from "@/app/lib/utilities/appError";
import { lang } from "@/app/lib/utilities/lang";
import tokenManager from "@/app/lib/utilities/TokenManager";
import twoFactorController from "@/app/server/controllers/2fa.controller";
import authController from "@/app/server/controllers/auth.controller";
import ErrorHandler from "@/app/server/controllers/error.controller";
import sessionController from "@/app/server/controllers/session.controller";
import { authControllerTranslate } from "@/public/locales/server/authControllerTranslate";

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
        const headerStore = await headers();
        let req;
        // let req: NextRequest = new NextRequest(
        //   new URL(process.env.NEXT_PUBLIC_API_ENDPOINT + "/auth"),
        //   {
        //     headers: headerStore,
        //   }
        // );
        try {
          const { email, password, code } = credentials as {
            email: string;
            password: string;
            code: number;
          };

          if (!code) {
            if (!email || !password) {
              throw new AppError(
                authControllerTranslate[
                  lang
                ].functions.logIn.invalidEmailOrPassword,
                400
              );
            }
            req = new NextRequest(
              new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth`),
              {
                headers: headerStore,
                method: "POST",
                body: JSON.stringify({
                  email: email,
                  password: password,
                }),
              }
            );

            const result = await authController.login(req);
            const statusCode = result.status;
            const {
              user,
              access_token,
              // refreshToken,
            }: {
              access_token: string;
              // refreshToken: string;
              user: UserAuthType;
            } = await result.json(); // Extract JSON data
            // Use a type guard to check if `user` has `requires2FA`

            if (statusCode === 202) {
              throw new AppError(
                authControllerTranslate[lang].functions.logIn.twoFactorRequired,
                401
              );
            }
            if (!user || statusCode !== 200) {
              throw new AppError(
                authControllerTranslate[
                  lang
                ].functions.logIn.invalidEmailOrPassword,
                400
              );
            }
            if ("_id" in user) {
              return {
                ...user,
                id: String(user._id),
                access_token,
                access_token_expires:
                  Date.now() +
                  Number(process.env.JWT_ACCESS_TOKEN_COOKIE_EXPIRES_IN || 15) *
                    60 *
                    1000,
              };
            }
            return null;
          }
          req = new NextRequest(
            new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/2fa/verify`),
            {
              headers: headerStore,
              method: "PUT",
              body: JSON.stringify({
                code: code,
                email,
              }),
            }
          );
          const result = await twoFactorController.verify2FALogin(req);
          const {
            user,
            access_token,
          }: {
            user: UserAuthType;
            access_token: string;
          } = await result.json(); // Extract JSON data

          if (!user) {
            throw new AppError(
              authControllerTranslate[lang].errors.notFoundUser,
              400
            );
          }
          return {
            ...user,
            id: String(user._id),
            access_token,
            access_token_expires:
              Date.now() +
              Number(process.env.JWT_ACCESS_TOKEN_COOKIE_EXPIRES_IN || 15) *
                60 *
                1000,
          };
        } catch (error) {
          if (req instanceof NextRequest) {
            const err = ErrorHandler(error, req);
            const { message, statusCode } = await err.json();
            throw new AppError(message, statusCode || 500);
          }
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: User;
      trigger?: "signIn" | "signUp" | "update";
      session?: Session;
    }) {
      // Initial login
      if (user) {
        // convert access_token_expires to readable time
        const exp = user.access_token_expires
          ? Math.floor(user.access_token_expires / 1000)
          : Number(process.env.JWT_ACCESS_TOKEN_COOKIE_EXPIRES_IN || 15) * 60;
        return {
          ...token,
          user,
          exp,
        };
      }

      // Session update
      if (trigger === "update" && session?.user) {
        // token.user = session.user;
        // token.access_token = session.access_token;
        // token.access_token_expires = session.;
        token.user = session.user;
      }

      // Only proceed with token refresh or access if no error
      if (!token.error && token.user) {
        const user = token.user as User;
        // Handle token refresh before expiration

        if (user.access_token_expires) {
          const remainingTime = user.access_token_expires - Date.now();

          if (remainingTime < REFRESH_THRESHOLD) {
            return await refreshAccessTokenHandler(token);
          }
        }

        if (user.access_token) {
          tokenManager.setAccessToken(user.access_token);
        }
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
async function refreshAccessTokenHandler(token: JWT): Promise<JWT> {
  try {
    const headerStore = await headers();
    const req = new NextRequest(
      new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/refresh-token`),
      {
        headers: headerStore,
        method: "GET",
      }
    );
    const result = await sessionController.refreshAccessToken(req);
    const {
      access_token,
    }: {
      access_token: string;
    } = await result.json();
    tokenManager.setAccessToken(access_token);
    return {
      ...token,
      user: {
        ...token.user,
        access_token,
        access_token_expires:
          Date.now() +
          Number(process.env.JWT_ACCESS_TOKEN_COOKIE_EXPIRES_IN || 15) *
            60 *
            1000, // 15 minutes
      },
      exp: Math.floor(
        Number(process.env.JWT_ACCESS_TOKEN_COOKIE_EXPIRES_IN || 15) * 60
      ), // Set JWT expiration
    };
  } catch (_error) {
    (await cookies()).delete("refreshAccessToken");
    return { ...token, error: "RefreshAccessTokenError" };
  }
}
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
