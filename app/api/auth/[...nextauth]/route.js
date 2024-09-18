import AppError from "@/components/util/appError";
import api from "@/components/util/axios.api";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: process.env.NEXTAUTH_SESSION_MAX_AGE * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const customHeaders = {
          "Content-Type": "application/json",
          "User-Agent": req?.headers["user-agent"] || "Unknown Device",
        };

        try {
          const { password, email } = credentials;

          if (!email || !password) {
            throw new AppError("Email and Password are required", 400);
          }
          const { data } = await api.post(
            "/auth/login",
            {
              email,
              password,
            },
            {
              headers: customHeaders,
            }
          );
          cookies().set("test", "test", {
            path: "/", // Ensure the cookie is available across all routes
            expires: new Date(
              Date.now() +
                process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRES_IN *
                  24 *
                  60 *
                  60 *
                  1000
            ),
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax", // 'Lax' in development if set none need secure to true
            secure: process.env.NODE_ENV === "production", // 'false' in development
            // domain: process.env.NODE_ENV === "production" ? undefined : undefined, // No domain in localhost
            // secure: req?.secure || req?.headers["x-forwarded-proto"] === "https",
          });
          return data;

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
      if (trigger === "update") {
        ///this use to make sure server is updated in serverside
        return { ...token, ...session.user };
      }

      return { ...token, ...user };
    },
    session: async ({ session, token }) => {
      if (session.user) session.user = token;
      return session;
    },
  },
  pages: { signIn: "/auth", newUser: "/auth/register" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
