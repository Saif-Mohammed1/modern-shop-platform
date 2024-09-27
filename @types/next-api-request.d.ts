import { UserAuthType } from "@/app/_server/controller/authController";

declare module "next/server" {
  interface NextRequest {
    user?: UserAuthType; // Adding `user` to NextApiRequest
    id?: string; // Adding `id` to NextApiRequest
  }
}
// next-api-request.d.ts
