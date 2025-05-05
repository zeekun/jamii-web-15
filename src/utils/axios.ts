import { MySession } from "@/types";
import axios from "axios";
import { getSession } from "next-auth/react";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Add a request interceptor to include the Authorization header
axiosInstance.interceptors.request.use(
  async (config) => {
    // List of routes where Authorization header should not be added
    const excludedRoutes = ["/auth/login"];

    // Check if the request URL matches any of the excluded routes
    if (excludedRoutes.some((route) => config.url?.includes(route))) {
      return config;
    }

    const session = (await getSession()) as unknown as MySession; // Fetch the session, which includes the accessToken

    if (session && session.user) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    // Include the User-Agent header
    config.headers["User-Agent"] = navigator.userAgent || "Unknown";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
