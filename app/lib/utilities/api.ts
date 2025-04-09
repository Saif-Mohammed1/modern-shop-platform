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
let refreshSubscribers: ((token: string) => void)[] = [];

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
      originalRequest._retry
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
        // Type the refresh token response
        const { data } = await api.get<{ accessToken: string }>(
          "/auth/refresh-token",
          {
            headers: originalRequest.headers,
          }
        );

        tokenManager.setAccessToken(data.accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;

        refreshSubscribers.forEach((cb) => cb(data.accessToken));
        refreshSubscribers = [];

        return api(originalRequest);
      } catch (_refreshError) {
        tokenManager.clearAccessToken();

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

    return new Promise((resolve) => {
      refreshSubscribers.push((newToken: string) => {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        resolve(api(originalRequest));
      });
    });
  }
);

export default api;
