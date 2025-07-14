import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { DateTimeResolver, EmailAddressResolver } from "graphql-scalars";
import type { NextRequest } from "next/server";

import logger from "@/app/lib/logger/logs";
import type { IUserDB } from "@/app/lib/types/users.db.types";

import { authResolvers } from "./resolvers/auth.resolvers";
import { shopResolvers } from "./resolvers/shop.resolvers";
import { authTypeDefs } from "./schema/auth.schema";
import { shopTypeDefs } from "./schema/shop.schema";

const scalarResolvers = {
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver,
};

// Merge all schemas and resolvers
const typeDefs = mergeTypeDefs([shopTypeDefs, authTypeDefs]);
const resolvers = mergeResolvers([
  shopResolvers,
  authResolvers,
  scalarResolvers,
]);

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
//Define the context type
export interface Context {
  req: NextRequest & { user?: IUserDB }; // Properly type the user property
  token?: string;
}
// Create Apollo Server with new v4 API
export const apolloServer = new ApolloServer<Context>({
  schema,
  introspection: process.env.NODE_ENV !== "production",
  formatError: (formattedError, error) => {
    logger.error("GraphQL Error:", error);

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === "production") {
      return new Error("Internal server error");
    }

    return formattedError;
  },
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({
      embed: true,
      footer: false,
      includeCookies: true,
    }),
    {
      async requestDidStart() {
        return {
          async didResolveOperation(requestContext) {
            logger.info("GraphQL Operation:", {
              operationName: requestContext.request.operationName,
              query: requestContext.request.query,
            });
          },
          async didEncounterErrors(requestContext) {
            logger.error("GraphQL Errors:", requestContext.errors);
          },
        };
      },
    },
  ],
});

export default apolloServer;
