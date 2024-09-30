import axios from "axios";
import tokenManager from "./TokenManager";

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach access token if available
api.interceptors.request.use(
  (config) => {
    //disable cache

    config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    config.headers["Pragma"] = "no-cache";
    config.headers["Expires"] = "0";
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    //console.log("token tokenManager", token);

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
        const { data } = await axios.post(
          // here user augent is  axios/1.7.7 how is it possible
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/refresh-token`,
          undefined,
          { headers: originalRequest.headers }
        );
        data.accessToken;
        // }
        // Update the original request with the new token and retry
        api.defaults.headers.common["Authorization"] =
          `Bearer ${data.accessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
        tokenManager.setAccessToken(data.accessToken);

        return api(originalRequest); // Retry the original request with updated token
      } catch (refreshError: any) {
        // if (process.env.NODE_ENV === "production") {
        if (typeof window !== "undefined" && window) {
          tokenManager.clearAccessToken();
          window.dispatchEvent(new Event("sessionExpired"));
        }

        return Promise.reject({
          status: refreshError?.response?.status || 500,
          message:
            refreshError.response?.data?.message ||
            "Network response was not ok.",
        });
      }
    }

    return Promise.reject({
      status: error?.response?.status || 500,
      message: error.response?.data?.message || "Network response was not ok.",
    });
  }
);

export default api;
