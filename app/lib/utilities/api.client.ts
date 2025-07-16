import "client-only";
import axios, {
  type AxiosRequestConfig,
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { logOutUser } from "@/components/providers/store/user/user.store";

import AppError from "./appError";
import tokenManager from "./TokenManager";

// Extend AxiosRequestConfig to include custom _retry property
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// GraphQL Response interfaces
interface GraphQLError {
  message: string;
  extensions?: {
    code: string;
    status: number;
  };
}

interface GraphQLResponse {
  data?: any;
  errors?: GraphQLError[];
}

interface RefreshTokenResponse {
  data: {
    refreshAccessToken: {
      access_token: string;
    };
  };
  errors?: Array<{ message: string }>;
}

// Create Axios instance
const api_client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshFailed = false; // New flag to stop refresh after failure

// Define subscriber interface with resolve and reject
interface Subscriber {
  resolve: (token: string) => void;
  reject: (error: AppError) => void;
}
let refreshSubscribers: Subscriber[] = [];

// Request interceptor to add token
api_client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api_client.interceptors.response.use(
  (response: AxiosResponse<GraphQLResponse>) => {
    // Handle GraphQL errors (GraphQL always returns 200 but may have errors in response body)
    if (
      response.data &&
      response.data.errors &&
      Array.isArray(response.data.errors)
    ) {
      const graphqlError = response.data.errors[0]; // Take the first error
      const message = graphqlError.message || "GraphQL Error";
      const statusCode = graphqlError.extensions?.status || 500;
      const errorCode = graphqlError.extensions?.code;

      // Create a synthetic axios error for GraphQL authentication errors
      // This allows the existing token refresh logic to work with GraphQL errors
      if (errorCode === "UNAUTHENTICATED" || statusCode === 401) {
        const authError = {
          config: response.config,
          response: {
            ...response,
            status: 401,
            data: { message },
          },
          message: message,
          isAxiosError: true,
        } as AxiosError;

        // Re-throw as axios error to trigger the existing auth logic
        return Promise.reject(authError);
      }

      // Handle other GraphQL errors
      return Promise.reject(new AppError(message, statusCode));
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Skip refresh if no 401, already retried, or refresh has failed
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      refreshFailed
    ) {
      const message =
        (error.response?.data as { message?: string })?.message ||
        "There was an issue processing your request. Please try again later.";
      const statusCode = error.response?.status || 500;
      return Promise.reject(new AppError(message, statusCode));
    }

    if (!isRefreshing) {
      isRefreshing = true;
      originalRequest._retry = true;

      try {
        // Use GraphQL mutation for token refresh
        const refreshQuery = `
          mutation {
            refreshAccessToken {
              access_token
            }
          }
        `;

        const response = await api_client.post<RefreshTokenResponse>(
          "/graphql",
          {
            query: refreshQuery,
          },
          { withCredentials: true }
        );

        // Handle GraphQL response for refresh token
        if (response.data.errors && response.data.errors.length > 0) {
          throw new Error(response.data.errors[0].message);
        }

        if (!response.data.data?.refreshAccessToken?.access_token) {
          throw new Error("Invalid refresh response structure");
        }

        const newToken = response.data.data.refreshAccessToken.access_token;
        tokenManager.setAccessToken(newToken);
        api_client.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        // Resolve all subscribers with new token
        refreshSubscribers.forEach((sub) => sub.resolve(newToken));
        refreshSubscribers = [];

        return api_client(originalRequest);
      } catch (_refreshError) {
        tokenManager.clearAccessToken();
        tokenManager.setLogOut(true);

        refreshFailed = true; // Mark refresh as permanently failed
        await logOutUser();
        // Reject all pending subscribers
        refreshSubscribers.forEach((sub) =>
          sub.reject(new AppError("Token refresh failed", 401))
        );
        refreshSubscribers = [];
        window.location.href = "/auth";
        return Promise.reject(new AppError("Redirecting to login...", 401));
      } finally {
        isRefreshing = false;
      }
    }

    // Queue request if refresh is in progress
    return new Promise((resolve, reject) => {
      refreshSubscribers.push({
        resolve: (newToken: string) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api_client(originalRequest));
        },
        reject: (error: AppError) => {
          reject(error);
        },
      });
    });
  }
);

export default api_client;
