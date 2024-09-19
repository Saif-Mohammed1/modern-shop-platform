import axios from "axios";
import tokenManager from "./TokenManager";
import { getCookiesValue } from "./cookies";
// export const fetchApi = async (url, options = {}) => {
//   if (!process.env.NEXT_PUBLIC_API_ENDPOINT) return;
//   // let token;
//   try {
//     // Make a fetch request

//     // if (token) {
//     //   options["headers"] = {
//     //     ...options["headers"],
//     //     "Content-Type": "application/json", // Set the default Content-Type header
//     //     Authorization: `Bearer ${token}`,
//     //   };
//     // } else {
//     //   options["headers"] = {
//     //     ...options["headers"],
//     //     "Content-Type": "application/json", // Set the default Content-Type header
//     //   };
//     // }
//     const response = await fetch(
//       process.env.NEXT_PUBLIC_API_ENDPOINT + url,
//       options
//     );

//     if (!response.ok) {
//       const err = await response.json();
//       // throw err;
//       throw {
//         status: response.status,
//         message: err?.message || "Network response was not ok.",
//       };
//     }
//     // Parse response JSON
//     const data = await response.json();
//     // Hide loading indicator

//     return { data };
//   } catch (error) {
//     if (process.env.NODE_ENV === "production") {
//       if (typeof window !== "undefined" && window && error.status === 401) {
//         window.dispatchEvent(new Event("sessionExpired"));
//       }
//     }
//     // return { error };
//     throw error;
//   }
// };
// export default api;
// Helper to fetch new access token using refresh token
const refreshAccessToken = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/refresh-token`,
    {
      method: "POST",
      credentials: "include", // Ensures cookies (refresh token) are sent
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw {
      status: response.status,
      message: err?.message || "Failed to refresh token",
    };
  }

  const data = await response.json();
  // Save the new access token (you might want to store it in localStorage or a token manager)
  tokenManager.setAccessToken(data.accessToken);
  return data.accessToken;
};

// Main API fetch function
export const fetchApi = async (url, options = {}) => {
  const token = tokenManager.getAccessToken(); // Get the stored access token

  // Add headers including the access token if it exists
  options.headers = {
    ...options.headers,
    "Content-Type": "application/json", // Set the default Content-Type header
    Authorization: token ? `Bearer ${token}` : "", // Attach the access token if available
  };

  try {
    // Make the fetch request
    const response = await fetch(
      process.env.NEXT_PUBLIC_API_ENDPOINT + url,
      options
    );

    // If the token has expired (401), try refreshing the token
    if (response.status === 401 && !options._retry) {
      options._retry = true; // Prevent retry loops

      try {
        const newToken = await refreshAccessToken(); // Get a new access token
        options.headers["Authorization"] = `Bearer ${newToken}`; // Update headers with new token

        // Retry the original request
        const retryResponse = await fetch(
          process.env.NEXT_PUBLIC_API_ENDPOINT + url,
          options
        );

        if (!retryResponse.ok) {
          const err = await retryResponse.json();
          throw {
            status: retryResponse.status,
            message: err?.message || "Network response was not ok.",
          };
        }

        return { data: await retryResponse.json() };
      } catch (refreshError) {
        throw {
          status: refreshError.status || 500,
          message: refreshError.message || "Failed to refresh token.",
        };
      }
    }

    if (!response.ok) {
      const err = await response.json();
      throw {
        status: response.status,
        message: err?.message || "Network response was not ok.",
      };
    }

    return { data: await response.json() };
  } catch (error) {
    if (process.env.NODE_ENV === "production" && error.status === 401) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("sessionExpired")); // Notify user to re-login
      }
    }

    throw error; // Throw error to be handled by the caller
  }
};

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
        // if (typeof window === "undefined" && !window) {
        //   const { data } = await axios.post(
        //     `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/refresh-token`,
        //     {},
        //     {
        //       withCredentials: true,
        //       headers: {
        //         Cookie: `refreshAccessToken=${getCookiesValue(
        //           "refreshAccessToken"
        //         )}`, // Manually add cookie if missing
        //       },
        //     }
        //   );
        //   accessToken = data.accessToken;
        // } else {
        // Call the refresh token API
        const { data } = await axios.post(
          // here user augent is  axios/1.7.7 how is it possible
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const accessToken = data.accessToken;
        // }
        // Update the original request with the new token and retry
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        tokenManager.setAccessToken(accessToken);

        return api(originalRequest); // Retry the original request with updated token
      } catch (refreshError) {
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
