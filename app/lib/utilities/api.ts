import "server-only";
import axios, {
  type AxiosRequestConfig,
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import AppError from "./appError";
import tokenManager from "./TokenManager";

// Extend AxiosRequestConfig to include custom _retry property
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Create Axios instance with proper typing
const api = axios.create({
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

// Add proper typing for request interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add proper typing for response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Handle non-401 errors or already retried requests
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

    // If we reach here, it means we need to refresh the token
    if (!isRefreshing) {
      isRefreshing = true;
      originalRequest._retry = true;

      try {
        // Type the refresh token response
        const { data } = await api.get<{ access_token: string }>(
          "/auth/refresh-token",
          {
            headers: originalRequest.headers,
          }
        );

        tokenManager.setAccessToken(data.access_token);
        api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;

        refreshSubscribers.forEach((sub) => sub.resolve(data.access_token));
        refreshSubscribers = [];

        return api(originalRequest);
      } catch (_refreshError) {
        refreshFailed = true; // Set flag to prevent further refresh attempts
        tokenManager.clearAccessToken();
        tokenManager.setLogOut(true);

        if (typeof window !== "undefined") {
          window.location.href = "/auth";
          return Promise.reject(new AppError("Redirecting to login...", 401));
        }

        return Promise.reject(
          new AppError("Session expired. Please login again.", 401)
        );
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
          resolve(api(originalRequest));
        },
        reject: (error: AppError) => {
          reject(error);
        },
      });
    });
  }
);

export default api;
