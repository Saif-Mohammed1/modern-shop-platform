import axios from "axios";
import tokenManager from "./TokenManager";
const fetchApiV11 = async (url, options = {}) => {
  if (!process.env.NEXT_PUBLIC_API_ENDPOINT) return;
  // let token;
  try {
    // Make a fetch request

    // if (token) {
    //   options["headers"] = {
    //     ...options["headers"],
    //     "Content-Type": "application/json", // Set the default Content-Type header
    //     Authorization: `Bearer ${token}`,
    //   };
    // } else {
    //   options["headers"] = {
    //     ...options["headers"],
    //     "Content-Type": "application/json", // Set the default Content-Type header
    //   };
    // }
    const response = await fetch(
      process.env.NEXT_PUBLIC_API_ENDPOINT + url,
      options
    );

    if (!response.ok) {
      const err = await response.json();
      // throw err;
      throw {
        status: response.status,
        message: err?.message || "Network response was not ok.",
      };
    }
    // Parse response JSON
    const data = await response.json();
    // Hide loading indicator

    return { data };
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      if (typeof window !== "undefined" && window && error.status === 401) {
        window.dispatchEvent(new Event("sessionExpired"));
      }
    }
    // return { error };
    throw error;
  }
};
// export default api;
/*
const api = async (url, options = {}) => {
  try {
    // Set default headers
    const defaultHeaders = {
      "Content-Type": "application/json", // Set the default Content-Type header
    };

    // Merge default headers with options.headers
    const headers = {
      ...defaultHeaders,
      ...options.headers,
    };

    // Make a fetch request with merged headers
    const response = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + url, {
      ...options,
      headers, // Set the merged headers
    });

    if (!response.ok) {
      const err = await response.json();
      throw err?.message || "Network response was not ok.";
    }

    // Parse response JSON
    const data = await response.json();

    return { data };
  } catch (error) {
    return { error };
  }
};

export default api;*/
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

      try {
        // Call the refresh token API
        const { data } = await axios.post(
          // here user augent is  axios/1.7.7 how is it possible
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        // Update the original request with the new token and retry
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${data.accessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
        tokenManager.setAccessToken(data.accessToken);

        return api(originalRequest); // Retry the original request with updated token
      } catch (refreshError) {
        // if (process.env.NODE_ENV === "production") {
        if (typeof window !== "undefined" && window) {
          tokenManager.clearAccessToken();
          window.dispatchEvent(new Event("sessionExpired"));
        }

        if (
          refreshError?.response?.status === 400 &&
          refreshError.response?.data?.message === "Missing required fields"
        ) {
          await axios.post(
            process.env.NEXT_PUBLIC_API_ENDPOINT + "/auth/signout",
            {},
            { withCredentials: true }
          );
        }

        return Promise.reject({
          status: refreshError?.response?.status || 500,
          message:
            refreshError.response?.data?.message ||
            "Network response was not ok.",
        });
      }
    }

    if (error.response && error.response.status === 400) {
    }

    return Promise.reject({
      status: error?.response?.status || 500,
      message: error.response?.data?.message || "Network response was not ok.",
    });
  }
);

export default api;
