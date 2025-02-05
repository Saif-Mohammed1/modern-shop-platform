import { IUserSchema } from "@/app/_server/models/user.model";

declare module "next/server" {
  interface NextRequest {
    // user?: UserAuthType; // Adding `user` to NextApiRequest
    user?: IUserSchema; // Adding `user` to NextApiRequest
    id?: string; // Adding `id` to NextApiRequest
    token?: string; // Adding `id` to NextApiRequest
  }
}
// next-api-request.d.ts
