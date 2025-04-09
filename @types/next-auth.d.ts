import "next-auth";
import "next-auth/jwt";

import type { UserAuthType } from "@/app/lib/types/users.types";

declare module "next-auth" {
  interface Session {
    user?: User;
    error?: string;
  }
  /**
   * interface User
The shape of the returned object in the OAuth providers' profile callback, available in the jwt and session callbacks, or the second parameter of the session callback, when using a database.

signIn callback | session callback | jwt callback | profile OAuth provider callback
 */
  interface User extends UserAuthType {
    accessTokenExpires?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: User; // type User = /*unresolved*/ any
    accessTokenExpires?: number;

    error?: string;
  }
  // interface User extends UserAuthType {
  //   accessTokenExpires?: number;
  // }
}
