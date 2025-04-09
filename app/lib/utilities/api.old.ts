import axios from "axios";

import AppError from "./appError";
import tokenManager from "./TokenManager";

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    // "Cache-Control": "no-cache, no-store, must-revalidate",
    // Pragma: "no-cache",
    // Expires: "0",
  },
});
// Track refresh token state
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

api.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      /**
       * const message = error.response?.data?.message || 
        "The request took too long to respond. Please refresh the page and try again.";
      const message = error.response?.data?.message || 
        "There was an issue processing your request. Please try again later.";
      const message = error.response?.data?.message || 
        "Unable to connect to the server. Please check your internet connection and try again.";
      const message = error.response?.data?.message || 
        "We're experiencing network issues. Please check your connection and try again.";

       */
      const message =
        error.response?.data?.message ||
        "There was an issue processing your request. Please try again later.";
      const statusCode = error.response?.status || 500;
      return Promise.reject(new AppError(message, statusCode));
    }

    if (!isRefreshing) {
      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const {
          data: { accessToken },
        } = await api.get("/auth/refresh-token", {
          headers: originalRequest.headers,
        });

        tokenManager.setAccessToken(accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        // Retry queued requests
        refreshSubscribers.forEach((cb) => {
          cb(accessToken);
        });
        refreshSubscribers = [];

        return api(originalRequest);
      } catch (_refreshError) {
        // // Clear all tokens and session data
        tokenManager.clearAccessToken();
        // tokenManager.clearRefreshToken();

        // Redirect only once
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
          return;
        }

        return Promise.reject(
          new AppError("Session expired. Please login again.", 401)
        );
      } finally {
        isRefreshing = false;
      }
    }

    // Queue requests while refreshing
    return new Promise((resolve, _) => {
      refreshSubscribers.push((newToken: string) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        resolve(api(originalRequest));
      });
    });
  }
);

export default api;
