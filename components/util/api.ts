import axios from "axios";
import tokenManager from "./TokenManager";
import AppError from "./appError";

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
});

// Request interceptor to attach access token if available
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and refresh token flow
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Prevent infinite retry loop
      // let accessToken;
      try {
        const { data } = await api.post(
          // here user augent is  axios/1.7.7 how is it possible
          `/auth/refresh-token`,
          undefined,
          { headers: originalRequest.headers }
        );

        // }
        // Update the original request with the new token and retry
        api.defaults.headers.common["Authorization"] =
          `Bearer ${data.accessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
        tokenManager.setAccessToken(data.accessToken);

        return api(originalRequest); // Retry the original request with updated token
      } catch (refreshError: any) {
        // console.log("refreshError", refreshError);
        // if (process.env.NODE_ENV === "production") {
        if (typeof window !== "undefined" && window) {
          //  tokenManager.clearAccessToken();
          //  window.dispatchEvent(new Event("sessionExpired"));
          window.location.href = "/auth";
        }

        // return Promise.reject({
        //   status: refreshError?.response?.status || 500,
        //   message:
        //     refreshError.response?.data?.message ||
        //     "Network response was not ok.",
        // });
        return Promise.reject(
          new AppError(
            refreshError?.response?.data?.message ||
              "Network response was not ok.",
            refreshError?.response?.status || 500
          )
        );
      }
    }

    // return Promise.reject({
    //   status: error?.response?.status || 500,
    //   message: error.response?.data?.message || "Network response was not ok.",

    // });

    return Promise.reject(
      new AppError(
        error?.response?.data?.message || "Network response was not ok.",
        error?.response?.status || 500
      )
    );
  }
);

export default api;
