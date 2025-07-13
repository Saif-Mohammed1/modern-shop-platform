import { startServerAndCreateNextHandler } from "@as-integrations/next";
import type { NextRequest } from "next/server";

import { apolloServer } from "@/app/server/graphql/apollo-server";

const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async (req: NextRequest) => {
    // Extract user information from request headers
    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    return {
      req,
      token,
      // Add user authentication logic here
    };
  },
});

export { handler as GET, handler as POST };
