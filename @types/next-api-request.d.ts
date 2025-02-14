// import { IUserSchema } from "@/app/_server/models/user.model";

import { IUser } from "@/app/api/v1/test/models/User.model";

declare module "next/server" {
  interface NextRequest {
    // user?: UserAuthType; // Adding `user` to NextApiRequest
    user?: IUser; // Adding `user` to NextApiRequest
    id?: string; // Adding `id` to NextApiRequest
    token?: string; // Adding `id` to NextApiRequest
    slug?: string; // Adding `slug` to NextApiRequest
  }
}
// next-api-request.d.ts
