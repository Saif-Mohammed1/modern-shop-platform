import { UserType } from "@/@types/next-auth";
import AppError from "@/components/util/appError";
import api from "@/components/util/axios.api";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: Number(process.env.NEXTAUTH_SESSION_MAX_AGE) * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",

          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",

          placeholder: "Enter your password",
        },
      },

      async authorize(credentials, req) {
        // const customHeaders = {
        //   "x-client-ip":
        //     req?.headers["x-client-ip"] ||
        //     req?.headers["x-forwarded-for"] ||
        //     req?.headers["x-real-ip"],
        //   "x-forwarded-for": req?.headers["x-forwarded-for"],
        //   "x-real-ip": req?.headers["x-real-ip"],
        //   "Content-Type": "application/json",
        //   "User-Agent": req?.headers["user-agent"] || "Unknown Device",
        // };
        const customHeaders = {
          "x-client-ip":
            req?.headers?.["x-client-ip"] ??
            req?.headers?.["x-forwarded-for"] ??
            req?.headers?.["x-real-ip"] ??
            "Unknown IP",
          "x-forwarded-for": req?.headers?.["x-forwarded-for"] ?? "Unknown IP",
          "x-real-ip": req?.headers?.["x-real-ip"] ?? "Unknown IP",
          "Content-Type": "application/json",
          "User-Agent": req?.headers?.["user-agent"] ?? "Unknown Device",
        };
        // throw new AppError(
        //   "This is a test error" + JSON.stringify(customHeaders),
        //   400
        // );
        try {
          type Credentials = {
            email: string;
            password: string;
          };
          const { password, email } = credentials as Credentials;

          if (!email || !password) {
            throw new AppError("Email and Password are required", 400);
          }
          const data = await api.post(
            "/auth/login",
            {
              email,
              password,
            },
            {
              headers: customHeaders,
            }
          );

          const setCookieHeader = data?.headers["set-cookie"]?.[0];
          const cookieParts = setCookieHeader?.split("; ");
          if (!cookieParts) {
            throw new AppError("No cookie found", 400);
          }
          const cookieValue = cookieParts[0].split("=")[1];
          const expiresPart = cookieParts.find((part) =>
            part.startsWith("Expires=")
          );
          if (!expiresPart) {
            throw new AppError("No expires found", 400);
          }
          const expiresDate = new Date(expiresPart?.split("=")[1]);
          const SameSiteValue = cookieParts
            .find((part) => part.startsWith("SameSite="))
            ?.split("=")[1] as "lax" | "strict" | "none";

          // im doing it because i want to set the cookie in the browser bexause nextauth is not setting the cookie in the browser
          cookies().set({
            name: "refreshAccessToken",
            value: cookieValue,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: SameSiteValue,
            expires: expiresDate,
            path: "/",
          });
          return data.data;

          // return {
          //   _id: user._id,
          //   name: user.name,
          //   email: user.email,
          //   emailVerify: user.emailVerify,
          //   // password: user.password,
          //   // photo: user.photo,
          //   role: user.role,
          //   createdAt: user.createdAt,
          // };
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        token.user = user as unknown as UserType;
      }
      if (trigger === "update") {
        ///this use to make sure server is updated in serverside
        // return { ...token, ...session.user };
        token.user = session.user;
      }

      // return { ...token, ...user };
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) session.user = token.user;
      return session;
    },
  },
  pages: {
    // signIn: "/auth"

    newUser: "/auth/register",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
