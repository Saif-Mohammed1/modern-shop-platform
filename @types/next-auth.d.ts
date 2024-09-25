export type UserType = {
  /** The user's postal address. */

  _id: string;
  name: string;
  email: string;
  emailVerify: boolean;
  // password: user.password,
  // photo: user.photo,
  role: string;
  createdAt: string;
  accessToken: string;
  phone: string;
};
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
