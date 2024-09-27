import { UserType } from "@/components/context/user.context";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: UserType;
  }
}
