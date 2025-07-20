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

  // formatError: (formattedError, error) => {
  //   try {
  //     // Extract the original error that might be wrapped inside the GraphQL error
  //     // Type guard to check if error has originalError property
  //     const originalError =
  //       error && typeof error === "object" && "originalError" in error
  //         ? (error as { originalError?: unknown }).originalError
  //         : null;

  //     const errorToCheck = originalError || error;

  //     // Debug logging for development
  //     if (process.env.NODE_ENV === "development") {
  //       logger.debug("GraphQL Error Debug:", {
  //         formattedMessage: formattedError.message,
  //         originalMessage:
  //           errorToCheck instanceof Error
  //             ? errorToCheck.message
  //             : String(errorToCheck),
  //         statusCode:
  //           errorToCheck instanceof AppError
  //             ? errorToCheck.statusCode
  //             : undefined,
  //         isAppError: errorToCheck instanceof AppError,
  //       });
  //     }

  //     // If the original error is an AppError, preserve its properties
  //     if (errorToCheck instanceof AppError) {
  //       // In production, return sanitized errors
  //       if (process.env.NODE_ENV === "production") {
  //         // Only expose client errors (4xx), hide server errors (5xx)
  //         if (errorToCheck.statusCode >= 500) {
  //           return {
  //             message: "Internal server error",
  //             extensions: {
  //               code: "INTERNAL_SERVER_ERROR",
  //               status: 500,
  //             },
  //           };
  //         }

  //         return {
  //           message: errorToCheck.message,
  //           extensions: {
  //             code:
  //               errorToCheck.statusCode === 401
  //                 ? "UNAUTHENTICATED"
  //                 : errorToCheck.statusCode >= 400 &&
  //                     errorToCheck.statusCode < 500
  //                   ? "CLIENT_ERROR"
  //                   : "INTERNAL_SERVER_ERROR",
  //             status: errorToCheck.statusCode,
  //           },
  //         };
  //       }

  //       // In development, return detailed error information
  //       return {
  //         message: errorToCheck.message,
  //         locations: formattedError.locations,
  //         path: formattedError.path,
  //         extensions: {
  //           code:
  //             errorToCheck.statusCode === 401
  //               ? "UNAUTHENTICATED"
  //               : errorToCheck.statusCode >= 400 &&
  //                   errorToCheck.statusCode < 500
  //                 ? "CLIENT_ERROR"
  //                 : "INTERNAL_SERVER_ERROR",
  //           status: errorToCheck.statusCode,
  //           stack: errorToCheck.stack,
  //         },
  //       };
  //     }

  //     // For other types of errors, return a safe formatted error
  //     return {
  //       message:
  //         process.env.NODE_ENV === "production"
  //           ? "Internal server error"
  //           : formattedError.message,
  //       locations: formattedError.locations,
  //       path: formattedError.path,
  //       extensions: {
  //         code: "INTERNAL_SERVER_ERROR",
  //         status: 500,
  //         ...(process.env.NODE_ENV === "development" && {
  //           stack: error instanceof Error ? error.stack : undefined,
  //         }),
  //       },
  //     };
  //   } catch (formatError) {
  //     // Fallback error formatting
  //     logger.error("Error formatting failed:", formatError);
  //     return {
  //       message: "Internal server error",
  //       extensions: {
  //         code: "INTERNAL_SERVER_ERROR",
  //         status: 500,
  //       },
  //     };
  //   }
  // },
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
