import axios from 'axios';

import AppError from './appError';
import tokenManager from './TokenManager';

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    // "Cache-Control": "no-cache, no-store, must-revalidate",
    // Pragma: "no-cache",
    // Expires: "0",
  },
});
// // Create a separate Axios instance for refreshing tokens
// const refreshApi = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
//   withCredentials: true,
// });
// // Request interceptor to attach access token if available
// api.interceptors.request.use(
//   (config) => {
//     const token = tokenManager.getAccessToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor to handle token expiration and refresh token flow
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (
//       error.response &&
//       error.response.status === 401 &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true; // Prevent infinite retry loop
//       // let accessToken;
//       try {
//         const { data } = await refreshApi.get(
//           // here user augent is  axios/1.7.7 how is it possible
//           `/auth/refresh-token`,
//           { headers: originalRequest.headers }
//         );

//         // }
//         // Update the original request with the new token and retry
//         api.defaults.headers.common["Authorization"] =
//           `Bearer ${data.accessToken}`;
//         originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
//         tokenManager.setAccessToken(data.accessToken);

//         return api(originalRequest); // Retry the original request with updated token
//       } catch (refreshError: any) {
//         // write this kind of error into file or log in root dir in log file call it refreshError.log
//         logErrorToFile(JSON.stringify(refreshError));

//         console.log("refreshError api", refreshError);
//         // if (process.env.NODE_ENV === "production") {
//         if (typeof window !== "undefined" && window) {
//           //  tokenManager.clearAccessToken();
//           //  window.dispatchEvent(new Event("sessionExpired"));
//           window.location.href = "/auth";
//         }

//         // return Promise.reject({
//         //   status: refreshError?.response?.status || 500,
//         //   message:
//         //     refreshError.response?.data?.message ||
//         //     "Network response was not ok.",
//         // });
//         return Promise.reject(
//           new AppError(
//             refreshError?.response?.data?.message ||
//               "Network response was not ok.",
//             refreshError?.response?.status || 500
//           )
//         );
//       }
//     }
//     console.log("error api", error);

//     // return Promise.reject({
//     //   status: error?.response?.status || 500,
//     //   message: error.response?.data?.message || "Network response was not ok.",

//     // });

//     return Promise.reject(
//       new AppError(
//         error?.response?.data?.message || "Network response was not ok.",
//         error?.response?.status || 500
//       )
//     );
//   }
// );

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
        'There was an issue processing your request. Please try again later.';
      const statusCode = error.response?.status || 500;
      return Promise.reject(new AppError(message, statusCode));
    }

    if (!isRefreshing) {
      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const {data} = await api.get('/auth/refresh-token', {
          headers: originalRequest.headers,
        });

        tokenManager.setAccessToken(data.accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;

        // Retry queued requests
        refreshSubscribers.forEach((cb) => cb(data.accessToken));
        refreshSubscribers = [];

        return api(originalRequest);
      } catch (_refreshError) {
        // // Clear all tokens and session data
        tokenManager.clearAccessToken();
        // tokenManager.clearRefreshToken();

        // Redirect only once
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
          return;
        }

        return Promise.reject(new AppError('Session expired. Please login again.', 401));
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
  },
);

export default api;
