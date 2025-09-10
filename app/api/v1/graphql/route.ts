import { startServerAndCreateNextHandler } from "@as-integrations/next";
import type { NextRequest } from "next/server";

import { apolloServer, type Context } from "@/app/server/graphql/apollo-server";

const handler = startServerAndCreateNextHandler<NextRequest, Context>(
  apolloServer,
  {
    context: async (req: NextRequest) => {
      return {
        req,
      };
    },
  }
);

export { handler as GET, handler as POST };
