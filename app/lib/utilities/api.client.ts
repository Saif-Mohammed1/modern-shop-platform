"use client";
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

// Create Axios instance with proper typing
const api_client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Add proper typing for request interceptor
api_client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add proper typing for response interceptor
api_client.interceptors.response.use(
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
        const { data } = await api_client.get<{ access_token: string }>(
          "/auth/refresh-token"
          // {
          //   headers: originalRequest.headers,
          // }
        );
        tokenManager.setAccessToken(data.access_token);
        api_client.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;

        refreshSubscribers.forEach((cb) => cb(data.access_token));
        refreshSubscribers = [];

        return api_client(originalRequest);
      } catch (_refreshError) {
        tokenManager.clearAccessToken();

        await logOutUser();
        window.location.href = "/auth";
        return Promise.reject(new AppError("Redirecting to login...", 401));
      } finally {
        isRefreshing = false;
      }
    }

    return new Promise((resolve) => {
      refreshSubscribers.push((newToken: string) => {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        resolve(api_client(originalRequest));
      });
    });
  }
);

export default api_client;
