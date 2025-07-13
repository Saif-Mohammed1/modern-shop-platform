import { ApolloServer } from "@apollo/server";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";

import logger from "@/app/lib/logger/logs";

import { auditResolvers } from "./resolvers/audit.resolvers";
import { auditTypeDefs } from "./schema/audit.schema";

// Merge all schemas and resolvers
const typeDefs = mergeTypeDefs([auditTypeDefs]);
const resolvers = mergeResolvers([auditResolvers]);

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create Apollo Server with new v4 API
export const apolloServer = new ApolloServer({
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
