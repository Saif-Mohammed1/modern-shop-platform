// lib/utilities/api.ts
import axios, { type AxiosRequestConfig, AxiosError } from "axios";

import AppError from "./appError";
import { tokenManager } from "./TokenManager.graphql";

interface GraphQLError {
  message: string;
  extensions?: { code: string; status: number };
}

interface GraphQLResponse {
  data?: any;
  errors?: GraphQLError[];
}

interface ErrorResponse {
  message?: string;
}

interface RefreshTokenResponse {
  data: {
    refreshAccessToken: { access_token: string };
  };
  errors?: Array<{ message: string }>;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// دالة مركزية لإجراء طلبات GraphQL
export async function api_gql<T>(
  query: string,
  variables?: any,
  headers?: Record<string, string>
): Promise<T> {
  const config: AxiosRequestConfig = {
    headers: {
      ...headers,
      Authorization: tokenManager.getAccessToken()
        ? `Bearer ${tokenManager.getAccessToken()}`
        : undefined,
    },
  };

  try {
    const response = await api.post<GraphQLResponse>(
      "/graphql",
      { query, variables },
      config
    );

    // التحقق من أخطاء GraphQL
    if (response.data.errors && response.data.errors.length > 0) {
      const error = response.data.errors[0];
      if (
        error.extensions?.code === "UNAUTHENTICATED" ||
        error.extensions?.status === 401
      ) {
        return handleTokenRefresh<T>(query, variables, headers);
      }
      throw new AppError(error.message, error.extensions?.status || 500);
    }

    return response.data.data as T;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      return handleTokenRefresh<T>(query, variables, headers);
    }
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as ErrorResponse;
    throw new AppError(
      errorData?.message || "There was an issue processing your request.",
      axiosError.response?.status || 500
    );
  }
}

// دالة لإدارة الـ token refresh
async function handleTokenRefresh<T>(
  query: string,
  variables?: any,
  headers?: Record<string, string>
): Promise<T> {
  if (tokenManager.isRefreshing()) {
    // انتظر حتى ينتهي الـ refresh
    return new Promise((resolve, reject) => {
      tokenManager.addRefreshSubscriber({
        resolve: (newToken: string) => {
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          api_gql<T>(query, variables, headers).then(resolve).catch(reject);
        },
        reject: (error: AppError) => reject(error),
      });
    });
  }

  tokenManager.setRefreshing(true);
  try {
    const refreshQuery = `
      mutation {
        refreshAccessToken {
          access_token
        }
      }
    `;

    // Create config with proper headers including cookies
    const refreshConfig: AxiosRequestConfig = {
      headers: {
        ...headers,
        // Ensure cookies are forwarded for refresh token
      },
      withCredentials: true,
    };

    const response = await api.post<RefreshTokenResponse>(
      "/graphql",
      { query: refreshQuery },
      refreshConfig
    );

    if (response.data.errors && response.data.errors.length > 0) {
      throw new Error(response.data.errors[0].message);
    }

    const newToken = response.data.data.refreshAccessToken.access_token;
    tokenManager.setAccessToken(newToken);
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

    // إعادة تنفيذ الطلب الأصلي
    return api_gql<T>(query, variables, headers);
  } catch (_error) {
    tokenManager.clearAccessToken();
    tokenManager.setLogOut(true);
    throw new AppError("Session expired. Please login again.", 401);
  } finally {
    tokenManager.setRefreshing(false);
    tokenManager.clearRefreshSubscribers();
  }
}
