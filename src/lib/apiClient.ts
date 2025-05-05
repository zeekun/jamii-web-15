// lib/apiClient.ts
import axios from "axios";
import { getSession, signOut } from "next-auth/react";
const apiClient = axios.create({
  baseURL: process.env.EXTERNAL_API_URL,
});

// Extend the Session type to include accessToken
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
  }
}
apiClient.interceptors.request.use(
  async (config) => {
    // Don't add auth header for auth routes (they're handled by Auth.js)
    if (config.url?.startsWith("/auth")) {
      return config;
    }

    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const session = await getSession();
        if (session?.refreshToken) {
          // Try to refresh the token through Next.js API route
          // which will call your external API
          const refreshResponse = await axios.post("/api/auth/refresh", {
            refreshToken: session.refreshToken,
          });

          // Update the session with new tokens
          // await updateSession({
          //   accessToken: refreshResponse.data.accessToken,
          //   refreshToken: refreshResponse.data.refreshToken,
          // });

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        await signOut();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
