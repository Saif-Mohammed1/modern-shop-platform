// apollo.client.ts
import "client-only";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { Observable } from "@apollo/client/utilities";
import axios from "axios";

import tokenManager from "./TokenManager";

// GraphQL mutation for refreshing access token
const GET_ACCESS_TOKEN = `
  mutation {
    refreshAccessToken {
      access_token
    }
  }
`;

// Type definitions for API responses
interface RefreshTokenResponse {
  data: {
    refreshAccessToken: {
      access_token: string;
    };
  };
  errors?: Array<{ message: string }>;
}

// Create a custom Apollo Link to handle token refresh
const createAuthRefreshLink = () => {
  let isRefreshing = false;
  let refreshSubscribers: ((token: string) => void)[] = [];

  const refreshToken = async (): Promise<string> => {
    try {
      const response = await axios.post<RefreshTokenResponse>(
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
        { query: GET_ACCESS_TOKEN },
        { withCredentials: true }
      );

      if (response.data.errors) {
        throw new Error("Token refresh failed");
      }

      const newToken = response.data.data.refreshAccessToken.access_token;
      tokenManager.setAccessToken(newToken);
      return newToken;
    } catch (_error) {
      throw new Error("Token refresh failed");
    }
  };

  return onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (
      (graphQLErrors?.some(
        (err) => err.extensions?.code === "UNAUTHENTICATED"
      ) ||
        (networkError &&
          "statusCode" in networkError &&
          networkError.statusCode === 401)) &&
      !operation.getContext().retry
    ) {
      // Mark operation to avoid infinite retry loops
      operation.setContext({ retry: true });

      if (!isRefreshing) {
        isRefreshing = true;
        return new Observable((observer) => {
          refreshToken()
            .then((newToken) => {
              // Update token in token manager
              tokenManager.setAccessToken(newToken);

              // Retry all queued requests with new token
              refreshSubscribers.forEach((callback) => callback(newToken));
              refreshSubscribers = [];

              // Retry the failed request
              forward(operation).subscribe(observer);
            })
            .catch((error) => {
              // Handle refresh failure
              tokenManager.clearAccessToken();
              tokenManager.setLogOut(true);
              window.location.href = "/auth";
              observer.error(error);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      }

      // Queue request while token is being refreshed
      return new Observable((observer) => {
        refreshSubscribers.push((newToken) => {
          // Update the operation context with new token
          const oldHeaders = operation.getContext().headers;
          operation.setContext({
            headers: {
              ...oldHeaders,
              authorization: `Bearer ${newToken}`,
            },
          });
          forward(operation).subscribe(observer);
        });
      });
    }
    return forward(operation);
  });
};

// Create Apollo Client with token refresh logic
const apolloClient = new ApolloClient({
  link: createAuthRefreshLink().concat(
    setContext((_, { headers }) => {
      const token = tokenManager.getAccessToken();
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : "",
        },
      };
    }).concat(
      createHttpLink({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
        credentials: "include",
      })
    )
  ),
  cache: new InMemoryCache(),
});

export default apolloClient;
