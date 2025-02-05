import { UserAuthType } from "@/app/_types/users";
import "next-auth";
import "next-auth/jwt";
// declare module "next-auth" {
//   /**
//    * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
//    */
//   interface Session {
//     user: UserAuthType;
//   }
// }

declare module "next-auth" {
  interface Session {
    user: UserAuthType;
    error?: string;
  }

  // interface User {
  //   accessTokenExpires?: number;
  //   // ... other fields
  // }
  interface User {
    accessTokenExpires?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: UserAuthType;
    accessTokenExpires?: number;
  }
}

// If using a database adapter
// declare module "next-auth/adapters" {
//   interface AdapterUser extends UserAuthType {
//     accessTokenExpires?: number;
//   }
// }
