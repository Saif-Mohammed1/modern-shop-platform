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
  (response: AxiosResponse) => response,
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
        const { data } = await api_client.get<{ access_token: string }>(
          "/auth/refresh-token",
          { withCredentials: true }
        );
        tokenManager.setAccessToken(data.access_token);
        api_client.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;

        // Resolve all subscribers with new token
        refreshSubscribers.forEach((sub) => sub.resolve(data.access_token));
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
