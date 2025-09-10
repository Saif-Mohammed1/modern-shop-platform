import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { DateTimeResolver, EmailAddressResolver } from "graphql-scalars";
import type { NextRequest } from "next/server";

import logger from "@/app/lib/logger/logs";
import type { IUserDB } from "@/app/lib/types/users.db.types";

import { graphqlErrorFormatter } from "../controllers/error.controller.graphql";

import { addressResolvers } from "./resolvers/address.resolvers";
import { authResolvers } from "./resolvers/auth.resolvers";
import { cartResolvers } from "./resolvers/cart.resolvers";
import { dashboardResolvers } from "./resolvers/dashboard.resolvers";
import { ordersResolvers } from "./resolvers/orders.resolvers";
import { refundResolvers } from "./resolvers/refund.resolvers";
import { reviewsResolvers } from "./resolvers/reviws.resolvers";
import { sessionsResolvers } from "./resolvers/sessions.resolvers";
import { shopResolvers } from "./resolvers/shop.resolvers";
import { twoFAResolvers } from "./resolvers/twofa.resolvers";
import { userResolvers } from "./resolvers/user.resolvers";
import { wishlistResolvers } from "./resolvers/wishlist.resolvers";
import { addressTypeDefs } from "./schema/addresses.schema";
import { authTypeDefs } from "./schema/auth.schema";
import { cartTypeDefs } from "./schema/cart.schema";
import { CommonTypeDefs } from "./schema/common.schema";
import { dashboardTypeDefs } from "./schema/dashboard.schema";
import { ordersTypeDefs } from "./schema/order.schema";
import { refundTypeDefs } from "./schema/refund.schema";
import { reviewsTypeDefs } from "./schema/reviews.schema";
import { sessionsTypeDefs } from "./schema/sessions.schema";
import { shopTypeDefs } from "./schema/shop.schema";
import { twoFATypeDefs } from "./schema/twofa.schema";
import { userTypeDefs } from "./schema/user.schema";
import { wishlistTypeDefs } from "./schema/wishlist.schema";

const scalarResolvers = {
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver,
};

// Merge all schemas and resolvers
const typeDefs = mergeTypeDefs([
  CommonTypeDefs,
  shopTypeDefs,
  authTypeDefs,
  twoFATypeDefs,
  sessionsTypeDefs,
  wishlistTypeDefs,
  cartTypeDefs,
  userTypeDefs,
  addressTypeDefs,
  reviewsTypeDefs,
  ordersTypeDefs,
  dashboardTypeDefs,
  refundTypeDefs,
]);
const resolvers = mergeResolvers([
  scalarResolvers,
  shopResolvers,
  authResolvers,
  twoFAResolvers,
  sessionsResolvers,
  wishlistResolvers,
  cartResolvers,
  userResolvers,
  addressResolvers,
  reviewsResolvers,
  ordersResolvers,
  dashboardResolvers,
  refundResolvers,
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
  formatError: graphqlErrorFormatter,
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
            const queryPreview = requestContext.request.query
              ? `${requestContext.request.query.substring(0, 500)}${requestContext.request.query.length > 500 ? "..." : ""}`
              : "";

            logger.info("GraphQL Operation:", {
              operationName: requestContext.request.operationName,
              variables: requestContext.request.variables,
              query: queryPreview,
            });
          },
          async didEncounterErrors(requestContext) {
            // Enhanced error logging with context
            requestContext.errors.forEach((error, index) => {
              logger.error(`GraphQL Error ${index + 1}:`, {
                message: error.message,
                path: error.path,
                locations: error.locations,
                extensions: error.extensions,
                operationName: requestContext.request.operationName,
                variables: requestContext.request.variables,
              });
            });
          },
          async willSendResponse(requestContext) {
            // Log successful responses in development
            if (
              process.env.NODE_ENV === "development" &&
              !requestContext.errors?.length
            ) {
              logger.debug("GraphQL Success:", {
                operationName: requestContext.request.operationName,
                hasData: requestContext.response.body.kind === "single",
              });
            }
          },
        };
      },
    },
  ],
});

export default apolloServer;
