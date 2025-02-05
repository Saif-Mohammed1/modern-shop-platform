import AppError from "@/components/util/appError";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies, headers } from "next/headers";
import { authControllerTranslate } from "@/app/_server/_Translate/authControllerTranslate";
import { lang } from "@/components/util/lang";
import { NextRequest } from "next/server";
import { logIn } from "@/app/_server/controller/authController";
import connectDB from "@/app/_server/db/db";
import { TwoFactorAuthService } from "@/app/_server/controller/2faController";
import { refreshAccessToken } from "@/app/_server/controller/refreshTokenController";
const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: Number(process.env.NEXTAUTH_SESSION_MAX_AGE || 15) * 60, // 15 minutes (access token lifetime)
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

            const { user, statusCode } = await logIn(req);

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
                user,
                id: String(user._id),
              };
            }
            return null;
          } else {
            const req = new NextRequest(
              new URL(process.env.NEXT_PUBLIC_API_ENDPOINT + "/auth"),
              {
                headers: headers(),
                method: "POST",
                body: JSON.stringify({
                  code: code,
                }),
              }
            );
            const { user } = await TwoFactorAuthService.verify2FAOnLogin(req);

            if (!user) {
              return null;
            }
            return {
              ...user,
              id: String(user._id),
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

        return { ...token, user };
      }

      // Session update
      if (trigger === "update") {
        // token.user = session.user;
        // token.accessToken = session.accessToken;
        // token.accessTokenExpires = session.;
        token.user = session.user;
      }

      // Handle token refresh
      if (
        token.user?.accessTokenExpires &&
        Date.now() > token.user.accessTokenExpires
      ) {
        console.log("Token expired, refreshing...");
        const refreshedToken = await refreshAccessTokenHandler(token);
        return refreshedToken;
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
  console.log("Refreshing access token...");
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

    const { accessToken } = await refreshAccessToken(req);

    return {
      ...token,
      user: {
        ...token.user,
        accessToken,
        accessTokenExpires:
          Date.now() +
          Number(process.env.NEXTAUTH_SESSION_MAX_AGE || 15) * 60 * 1000, // 15 minutes
      },
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    cookies().delete("refreshAccessToken");
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
