// import type{ IUser }  from "@/app/_server/models/user.model";
import type { IUserDB } from "@/app/lib/types/users.db.types";

declare module "next/server" {
  interface NextRequest {
    // user?: UserAuthType; // Adding `user` to NextApiRequest
    user?: IUserDB; // Adding `user` to NextApiRequest
    id?: string; // Adding `id` to NextApiRequest
    token?: string; // Adding `id` to NextApiRequest
    slug?: string; // Adding `slug` to NextApiRequest
  }
}
// next-api-request.d.ts
