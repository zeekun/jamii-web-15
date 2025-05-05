// src/lib/auth/authOptions.ts
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

import { JWT } from "@auth/core/jwt";
import { MyUser, MySession } from "@/types";

async function refreshAccessToken(token: JWT) {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/refresh`,
      {
        refreshToken: token.refreshToken,
      }
    );

    const { accessToken, refreshToken, expiresIn } = response.data;

    return {
      ...token,
      accessToken,
      refreshToken: refreshToken || token.refreshToken,
      accessTokenExpires: Date.now() + expiresIn * 1000,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        // For username login
        username: {},
        // For phone login
        phoneNumber: {},
        // For email login
        email: {},
        // Common fields
        password: {},
        loginMethod: {},
        otp: {},
      },
      async authorize(credentials) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/login`,
            credentials
          );

          const { user, tokens } = response.data;

          return {
            ...user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            accessTokenExpires: Date.now() + tokens.expiresIn * 1000,
          };
        } catch (error) {
          console.error("Authentication failed:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      const myUser = user as MyUser;
      if (account && user) {
        return {
          ...token,
          accessToken: myUser.accessToken,
          refreshToken: myUser.refreshToken,
          user,
        };
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      const mySession = session as unknown as MySession;

      mySession.user = token.user as MyUser;
      mySession.accessToken = token.accessToken as string | undefined;

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
