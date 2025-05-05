"use client";
import { useUrlTracker } from "@/hooks/url-tracker";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (
    newAccessToken: string | null,
    newRefreshToken: string | null
  ) => void;
  clearTokens: () => void;
}

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  refreshToken: null,
  setTokens: () => {},
  clearTokens: () => {},
});

interface TokenPayload {
  exp: number;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useUrlTracker();

  const refreshAccessToken = useCallback(async (storedRefreshToken: string) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/refresh`,
        {
          refreshToken: storedRefreshToken,
        }
      );

      const newAccessToken = response.data.accessToken;
      const newRefreshToken = response.data.refreshToken;

      setTokens(newAccessToken, newRefreshToken);
    } catch (error) {
      console.error("Error refreshing token:", error);
      clearTokens();
    }
  }, []);

  const setTokens = useCallback(
    (newAccessToken: string | null, newRefreshToken: string | null) => {
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      if (newAccessToken && newRefreshToken) {
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        const decodedToken = jwtDecode<TokenPayload>(newAccessToken);
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = decodedToken.exp - currentTime;
        const refreshTime = Math.max(timeUntilExpiry - 30, 0);

        if (refreshTime > 0) {
          setTimeout(() => {
            refreshAccessToken(newRefreshToken);
          }, refreshTime * 1000);
        }
      } else {
        clearTokens();
      }
    },
    [refreshAccessToken]
  );

  const clearTokens = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }, []);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (storedAccessToken && storedRefreshToken) {
      try {
        const decodedToken = jwtDecode<TokenPayload>(storedAccessToken);
        const currentTime = Math.floor(Date.now() / 1000);

        if (decodedToken.exp < currentTime) {
          refreshAccessToken(storedRefreshToken);
        } else {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);

          const timeUntilExpiry = decodedToken.exp - currentTime;
          const refreshTime = Math.max(timeUntilExpiry - 30, 0);

          if (refreshTime > 0) {
            setTimeout(() => {
              refreshAccessToken(storedRefreshToken);
            }, refreshTime * 1000);
          }
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        clearTokens();
      }
    }
  }, [refreshAccessToken, clearTokens]);

  return (
    <AuthContext.Provider
      value={{ accessToken, refreshToken, setTokens, clearTokens }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
